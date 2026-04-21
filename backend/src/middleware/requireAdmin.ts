export function requireAdmin(req: any, res: any, next: any) {
  if (!req.user) {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.user.role.toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Acceso denegado" });
  }

  next();
}
