import { authMiddleware } from "../src/middleware/auth.middleware";
import jwt from "jsonwebtoken";
import { pool } from "../src/config/db";

jest.mock("jsonwebtoken");
jest.mock("../src/config/db");

describe("authMiddleware", () => {

  const mockReq: any = {
    headers: {}
  };
  const mockRes: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("devuelve 401 si no hay token", async () => {
    mockReq.headers.authorization = undefined;

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Token requerido" });
  });

  test("devuelve 403 si el token es inválido", async () => {
    mockReq.headers.authorization = "Bearer token123";
    (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error(); });

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Token inválido" });
  });

  test("devuelve 401 si el usuario no existe", async () => {
    mockReq.headers.authorization = "Bearer token123";
    (jwt.verify as jest.Mock).mockReturnValue({ sub: 1, tokenVersion: 1 });

    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
  });

  test("devuelve 401 si tokenVersion no coincide", async () => {
    mockReq.headers.authorization = "Bearer token123";
    (jwt.verify as jest.Mock).mockReturnValue({ sub: 1, tokenVersion: 1 });

    (pool.query as jest.Mock).mockResolvedValue({ rows: [{ token_version: 2 }] });

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Token revocado" });
  });

  test("llama a next() si el token es válido", async () => {
    mockReq.headers.authorization = "Bearer token123";
    (jwt.verify as jest.Mock).mockReturnValue({ sub: 1, tokenVersion: 1 });

    (pool.query as jest.Mock).mockResolvedValue({ rows: [{ token_version: 1 }] });

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toEqual({ sub: 1, tokenVersion: 1 });
  });
});
