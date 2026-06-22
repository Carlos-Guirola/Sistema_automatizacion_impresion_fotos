import nodemailer from 'nodemailer';

function getTransporter() {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 587);
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

function buildVerificationUrl(token) {
  const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 4000}`;
  return `${apiUrl}/api/auth/verificar-correo/${token}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function sendWelcomeEmail({ to, nombre, token }) {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn('Correo no enviado: configuracion SMTP incompleta.');
    return;
  }

  const verificationUrl = buildVerificationUrl(token);
  const safeName = escapeHtml(nombre);
  const safeEmail = escapeHtml(to);

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to,
    subject: 'Bienvenido/a a ToolsPrint',
    html: `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
        <h2 style="color: #e11d74;">Bienvenido/a a ToolsPrint, ${safeName}</h2>
        <p>Tu cuenta ya esta activa y tienes una prueba gratuita de <strong>15 dias</strong>.</p>
        <p>Tu usuario es: <strong>${safeEmail}</strong></p>
        <p>Usa la contrasena que creaste al registrarte.</p>
        <p>
          Para confirmar que este correo existe, haz clic aqui:
          <br />
          <a href="${verificationUrl}" style="color: #e11d74; font-weight: bold;">
            Verificar mi correo
          </a>
        </p>
        <p>Si no solicitaste esta cuenta, puedes ignorar este mensaje.</p>
      </div>
    `,
  });
}
