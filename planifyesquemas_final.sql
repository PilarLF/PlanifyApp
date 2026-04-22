

/* ============================================================
   1. TABLA USUARIOS
   ============================================================ */

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'EMPLOYEE')),
    position VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

/* Ãndice recomendado para bÃºsquedas por email */
CREATE INDEX idx_usuarios_email ON usuarios(email);



/* ============================================================
   2. TABLA HORARIOS 
   ============================================================ */

CREATE TABLE horarios (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    CHECK (end_time > start_time)
);

/* Ãndices recomendados */
CREATE INDEX idx_horarios_employee ON horarios(employee_id);
CREATE INDEX idx_horarios_start ON horarios(start_time);



/* ============================================================
   3. TABLA FICHAJES
   ============================================================ */

CREATE TABLE fichajes (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    schedule_id INTEGER NOT NULL REFERENCES horarios(id) ON DELETE CASCADE,
    clock_in TIMESTAMP NOT NULL,
    clock_out TIMESTAMP,
    total_minutes INTEGER,
    CHECK (clock_out IS NULL OR clock_out > clock_in)
);

/* Ãndices recomendados */
CREATE INDEX idx_fichajes_employee ON fichajes(employee_id);
CREATE INDEX idx_fichajes_schedule ON fichajes(schedule_id);



/* ============================================================
   4. TABLA DE AUDITORÃA
   ============================================================ */

CREATE TABLE fichajes_auditoria (
    id SERIAL PRIMARY KEY,
    fichaje_id INTEGER NOT NULL REFERENCES fichajes(id),
    employee_id INTEGER NOT NULL,
    schedule_id INTEGER NOT NULL,
    clock_in TIMESTAMP NOT NULL,
    clock_out TIMESTAMP,
    total_minutes INTEGER,
    changed_at TIMESTAMP DEFAULT NOW(),
    changed_by INTEGER REFERENCES usuarios(id),
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
);

/* Ãndice recomendado */
CREATE INDEX idx_fichajes_auditoria_fichaje ON fichajes_auditoria(fichaje_id);



/* ============================================================
   5. TRIGGERS DE AUDITORÃA
   Cada vez que se inserta, actualiza o elimina un fichaje,
   se guarda una copia en fichajes_auditoria.
   ============================================================ */

CREATE OR REPLACE FUNCTION auditoria_fichajes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO fichajes_auditoria (
            fichaje_id, employee_id, schedule_id, clock_in, clock_out,
            total_minutes, changed_by, action
        )
        VALUES (
            NEW.id, NEW.employee_id, NEW.schedule_id, NEW.clock_in,
            NEW.clock_out, NEW.total_minutes, current_setting('app.current_user')::INTEGER,
            'INSERT'
        );
        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO fichajes_auditoria (
            fichaje_id, employee_id, schedule_id, clock_in, clock_out,
            total_minutes, changed_by, action
        )
        VALUES (
            NEW.id, NEW.employee_id, NEW.schedule_id, NEW.clock_in,
            NEW.clock_out, NEW.total_minutes, current_setting('app.current_user')::INTEGER,
            'UPDATE'
        );
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO fichajes_auditoria (
            fichaje_id, employee_id, schedule_id, clock_in, clock_out,
            total_minutes, changed_by, action
        )
        VALUES (
            OLD.id, OLD.employee_id, OLD.schedule_id, OLD.clock_in,
            OLD.clock_out, OLD.total_minutes, current_setting('app.current_user')::INTEGER,
            'DELETE'
        );
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_auditoria_fichajes
AFTER INSERT OR UPDATE OR DELETE ON fichajes
FOR EACH ROW EXECUTE FUNCTION auditoria_fichajes();
