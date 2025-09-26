// Mostrar y ocultar contraseña
document.getElementById('togglePassword').addEventListener('click', function () {
  const contrasena = document.getElementById('contrasena');
  const icono = document.getElementById('eyeIcon');

  if (contrasena.type !== 'password') {
    contrasena.type = 'password';
    icono.classList.remove('fa-eye-slash');
    icono.classList.add('fa-eye');
  } else {
    contrasena.type = 'text';
    icono.classList.remove('fa-eye');
    icono.classList.add('fa-eye-slash');
  }
});

document.getElementById('loginForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const usuario = document.getElementById('usuario').value;
  const contrasena = document.getElementById('contrasena').value;

  if (!usuario || !contrasena) {
    alert('Por favor, completa todos los campos.');
    return;
  }

  const regexUsuario = /^[a-zA-Z]+$/;
  if (!regexUsuario.test(usuario)) {
    alert('El usuario solo puede contener letras.');
    return;
  }

  const regexContrasena = /^[a-zA-Z0-9]+$/;
  if (!regexContrasena.test(contrasena)) {
    alert('La contraseña solo puede contener letras y números.');
    return;
  }
  try {
    const response = await fetch("https://ue-san-jose-gxkx.onrender.com/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",   // 👈 guarda cookie
      body: JSON.stringify({ usuario, contrasena })
    });
    if (response.status === 404) {
      // Redirigir a página 404
      window.location.href = "pages/404.html";
      return;
    }

    const respuesta = await response.json();

    if (respuesta.ok) {
      alert(respuesta.message);

      // Ya no guardo en sessionStorage, sino que pregunto al backend
      const me = await fetch("https://ue-san-jose-gxkx.onrender.com/api/login/me", {
        credentials: "include"
       }).then(r => r.json());

      if (me.rol === 'administrador') {
        window.location.href = "pages/administrador.html";
      } else if (me.rol === 'secretaria') {
        window.location.href = "pages/area_secretaria.html";
      } else if (me.rol === 'docente') {
        window.location.href = "pages/area_docente.html";
      } else if (me.rol === 'colecturia') {
        window.location.href = "pages/area_colecturia.html";
      } else if (me.rol.startsWith('evaluador')) {
        window.location.href = "encuestas.html";
      } else {
        alert("Rol no reconocido.");
      }
    } else {
      alert(respuesta.error);
    }
  } catch (error) {
    console.error("Error al conectar con el servidor:", error);
    alert("Error de conexión. Intenta más tarde.");
  }
});
