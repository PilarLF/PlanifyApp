import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { login, register, getEmployees } from '../src/controllers/auth.controller';
import { pool } from '../src/config/db';
import { validationResult } from 'express-validator';

// ─── Mocks globales ──────────────────────────────────────────────────────────
jest.mock('../src/config/db', () => ({ pool: { query: jest.fn() } }));
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
  body: jest.fn().mockReturnThis(),
}));

const mockPool = pool as jest.Mocked<typeof pool>;
const mockValidation = validationResult as jest.MockedFunction<typeof validationResult>;

process.env.JWT_SECRET = 'test_secret_planify';

// ─── Helpers ────────────────────────────────────────────────────────────────
function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

function noValidationErrors() {
  mockValidation.mockReturnValue({ isEmpty: () => true, array: () => [] } as any);
}

function withValidationErrors() {
  mockValidation.mockReturnValue({
    isEmpty: () => false,
    array: () => [{ msg: 'Email inválido', param: 'email' }]
  } as any);
}

// ════════════════════════════════════════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════════════════════════════════════════
describe('auth.controller → login()', () => {

  afterEach(() => jest.clearAllMocks());

  it('devuelve 400 cuando hay errores de validación', async () => {
    withValidationErrors();
    const req: any = { body: { email: 'no-es-email', password: '' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
  });

  it('devuelve 404 cuando el usuario no existe en la BD', async () => {
    noValidationErrors();
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const req: any = { body: { email: 'nadie@test.com', password: '123456' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
  });

  it('devuelve 401 cuando la contraseña es incorrecta', async () => {
    noValidationErrors();
    const hash = await bcrypt.hash('correcta', 10);
    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: 1, name: 'Ana', email: 'ana@test.com', password: hash, role: 'EMPLOYEE', token_version: 0, photo_url: null }]
    });

    const req: any = { body: { email: 'ana@test.com', password: 'incorrecta' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Contraseña incorrecta' });
  });

  it('devuelve 200 con token JWT cuando las credenciales son correctas', async () => {
    noValidationErrors();
    const hash = await bcrypt.hash('mi_pass', 10);
    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: 5, name: 'Carlos', email: 'carlos@test.com', password: hash, role: 'ADMIN', token_version: 0, photo_url: 'https://example.com/foto.jpg' }]
    });

    const req: any = { body: { email: 'carlos@test.com', password: 'mi_pass' } };
    const res = mockRes();

    await login(req, res);

    // No debe haber llamada a status (200 es la respuesta por defecto vía res.json directo)
    expect(res.status).not.toHaveBeenCalled();
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg).toHaveProperty('token');
    expect(jsonArg.user.email).toBe('carlos@test.com');
    expect(jsonArg.user.role).toBe('ADMIN');
    // Verificar que el token es un JWT válido
    const decoded: any = jwt.verify(jsonArg.token, process.env.JWT_SECRET!);
    expect(decoded.sub).toBe(5);
    expect(decoded.tokenVersion).toBe(0);
  });

  it('devuelve 200 y usa la foto por defecto si photo_url es null', async () => {
    noValidationErrors();
    const hash = await bcrypt.hash('pass', 10);
    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: 9, name: 'Sin foto', email: 'sinfoto@test.com', password: hash, role: 'EMPLOYEE', token_version: 0, photo_url: null }]
    });

    const req: any = { body: { email: 'sinfoto@test.com', password: 'pass' } };
    const res = mockRes();

    await login(req, res);

    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.user.photo_url).toContain('default-img.jpg');
  });

  it('devuelve 500 cuando falla la consulta a la BD', async () => {
    noValidationErrors();
    (mockPool.query as jest.Mock).mockRejectedValueOnce(new Error('DB connection lost'));

    const req: any = { body: { email: 'test@test.com', password: 'pass' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error en el servidor' });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// REGISTER
// ════════════════════════════════════════════════════════════════════════════
describe('auth.controller → register()', () => {

  afterEach(() => jest.clearAllMocks());

  it('devuelve 400 cuando hay errores de validación', async () => {
    withValidationErrors();
    const req: any = { body: {}, file: undefined };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('devuelve 400 cuando faltan campos requeridos en el body', async () => {
    noValidationErrors();
    const req: any = { body: { name: 'Paco' }, file: undefined }; // sin email, pass, role
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Faltan campos requeridos' });
  });

  it('devuelve 400 cuando el email ya está registrado', async () => {
    noValidationErrors();
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 1 }] }); // email existe

    const req: any = {
      body: { name: 'Paco', email: 'paco@test.com', password: 'abc123', role: 'EMPLOYEE' },
      file: undefined
    };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'El email ya está registrado' });
  });

  it('devuelve 201 y el usuario creado cuando todo es correcto (sin foto)', async () => {
    noValidationErrors();
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [] }) // email no existe
      .mockResolvedValueOnce({             // INSERT OK
        rows: [{ id: 10, name: 'Nuevo', email: 'nuevo@test.com', role: 'EMPLOYEE', photo_url: 'https://planifyapphrr.netlify.app/assets/default-img.jpg' }]
      });

    const req: any = {
      body: { name: 'Nuevo', email: 'nuevo@test.com', password: 'abc123', role: 'EMPLOYEE' },
      file: undefined
    };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.email).toBe('nuevo@test.com');
    expect(jsonArg).not.toHaveProperty('password');
  });

  it('devuelve 201 y usa la URL de uploads cuando se adjunta una foto', async () => {
    noValidationErrors();
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ id: 11, name: 'Con foto', email: 'foto@test.com', role: 'EMPLOYEE', photo_url: 'https://planifyapp.onrender.com/uploads/foto.jpg' }]
      });

    const req: any = {
      body: { name: 'Con foto', email: 'foto@test.com', password: 'abc123', role: 'EMPLOYEE' },
      file: { filename: 'foto.jpg' }
    };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    // Verificar que la llamada al INSERT incluyó la URL del archivo subido
    const insertCall = (mockPool.query as jest.Mock).mock.calls[1];
    expect(insertCall[1][4]).toContain('uploads/foto.jpg');
  });

  it('devuelve 500 cuando falla la BD durante el registro', async () => {
    noValidationErrors();
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [] })
      .mockRejectedValueOnce(new Error('DB error'));

    const req: any = {
      body: { name: 'X', email: 'x@test.com', password: 'abc123', role: 'EMPLOYEE' },
      file: undefined
    };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// GET EMPLOYEES
// ════════════════════════════════════════════════════════════════════════════
describe('auth.controller → getEmployees()', () => {

  afterEach(() => jest.clearAllMocks());

  it('devuelve 200 con el listado de empleados', async () => {
    const empleados = [
      { id: 1, name: 'Ana', email: 'ana@test.com', photo_url: null },
      { id: 2, name: 'Bea', email: 'bea@test.com', photo_url: null },
    ];
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: empleados });

    const req: any = {};
    const res = mockRes();

    await getEmployees(req, res);

    expect(res.json).toHaveBeenCalledWith(empleados);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('devuelve array vacío si no hay empleados', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const req: any = {};
    const res = mockRes();

    await getEmployees(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('devuelve 500 cuando la BD falla', async () => {
    (mockPool.query as jest.Mock).mockRejectedValueOnce(new Error('BD caída'));

    const req: any = {};
    const res = mockRes();

    await getEmployees(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error en el servidor' });
  });
});