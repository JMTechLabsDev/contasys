This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configuración de autenticación con Supabase

Antes de probar el registro, define en `.env.local` las mismas variables de `.env.example`. En producción, configura también esos valores en Vercel. `NEXT_PUBLIC_APP_URL` debe ser la URL pública final, sin `/` al final:

```env
NEXT_PUBLIC_APP_URL=https://contasys-ec.vercel.app
```

En Supabase ve a **Authentication → URL Configuration** y configura:

| Campo                      | Valor                            |
| -------------------------- | -------------------------------- |
| Site URL                   | `https://contasys-ec.vercel.app` |
| Redirect URLs              | `https://contasys-ec.vercel.app` |
| Redirect URLs (desarrollo) | `http://localhost:3000`          |

Si utilizas previews de Vercel, agrega además `https://*-tu-equipo.vercel.app/**`, sustituyendo `tu-equipo` por tu dominio real de previews. No uses ese comodín para el dominio de producción.

En **Authentication → Providers → Email**, habilita **Confirm email**. Después, en **Authentication → Email Templates → Confirm signup**, usa una plantilla que envíe al usuario a la ruta de confirmación de la aplicación:

```html
<h2>Confirma tu correo</h2>
<p>Hola {{ .Data.nombre }},</p>
<p>Para activar tu cuenta de ContaSys, confirma tu correo:</p>
<p>
  <a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=email"
    >Confirmar mi correo</a
  >
</p>
<p>Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
```

Usa como asunto: `Confirma tu correo para activar ContaSys`. La variable `{{ .RedirectTo }}` hace que el enlace apunte a localhost en desarrollo y al dominio correcto en producción.

Para **Authentication → Email Templates → Reset password**, usa esta plantilla. No reutilices la de registro: el valor `type=recovery` es el que autoriza a la persona a cambiar su contraseña.

```html
<h2>Restablece tu contraseña</h2>
<p>Recibimos una solicitud para cambiar la contraseña de tu cuenta de ContaSys.</p>
<p>
  <a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=recovery"
    >Crear una nueva contraseña</a
  >
</p>
<p>Este enlace es de un solo uso. Si no solicitaste el cambio, ignora este correo.</p>
```

Usa como asunto: `Restablece tu contraseña de ContaSys`.

### Entrega de correos y spam

El correo SMTP incluido por Supabase es solo para pruebas. Para producción, en **Authentication → SMTP Settings**, configura un proveedor SMTP transaccional y un remitente de un subdominio propio, por ejemplo `no-reply@auth.tudominio.com`. Publica los registros SPF, DKIM y DMARC que entregue ese proveedor; no actives el seguimiento/click tracking de enlaces en los correos de autenticación. Mantén estos correos separados de los de marketing.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
