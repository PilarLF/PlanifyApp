import { requireAdmin } from "../src/middleware/requireAdmin";

describe("requireAdmin middleware", () => {

  const mockReq: any = {};
  const mockRes: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("devuelve 401 si no hay req.user", () => {
    mockReq.user = undefined;

    requireAdmin(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "No autorizado" });
  });

  test("devuelve 403 si el rol no es admin", () => {
    mockReq.user = { role: "employee" };

    requireAdmin(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Acceso denegado" });
  });

  test("llama a next() si el rol es admin", () => {
    mockReq.user = { role: "admin" };

    requireAdmin(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});
