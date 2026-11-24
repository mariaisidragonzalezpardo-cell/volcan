/* Café Volcán - JavaScript
   1. Año automático  2. Menú móvil  3. Filtro de galería
   4. Pedido y factura  5. Validación del formulario */
document.addEventListener("DOMContentLoaded", () => {

  // 1. Año actual en el pie de página
  document.getElementById("anio").textContent = new Date().getFullYear();

  // 2. Menú móvil
  const boton = document.querySelector(".nav-toggle");
  const menu = document.getElementById("menu-principal");
  boton.addEventListener("click", () => {
    const abierto = menu.classList.toggle("abierto");
    boton.setAttribute("aria-expanded", abierto);
    boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  });

  // 3. Filtro de galería
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach(c => c.classList.remove("activo"));
      chip.classList.add("activo");
      const filtro = chip.dataset.filtro;
      document.querySelectorAll("#galeria figure").forEach(fig => {
        fig.hidden = filtro !== "todos" && fig.dataset.cat !== filtro;
      });
    });
  });

  // 4. Pedido y factura (solo en menu.html)
  const lista = document.getElementById("lista-pedido");
  if (lista) {
    const ITBMS = 0.07;
    const pedido = {};
    const dinero = n => "B/. " + n.toFixed(2);

    const calcular = () => {
      const sub = Object.values(pedido).reduce((s, i) => s + i.precio * i.cant, 0);
      return { sub, imp: sub * ITBMS, total: sub * (1 + ITBMS) };
    };

    const pintar = () => {
      lista.textContent = "";
      const items = Object.entries(pedido);
      document.getElementById("pedido-vacio").hidden = items.length > 0;
      items.forEach(([nombre, i]) => {
        const li = document.createElement("li");
        const txt = document.createElement("span");
        txt.textContent = i.cant + " × " + nombre;
        const precio = document.createElement("b");
        precio.textContent = dinero(i.precio * i.cant);
        const quitar = document.createElement("button");
        quitar.type = "button";
        quitar.className = "quitar";
        quitar.textContent = "−";
        quitar.setAttribute("aria-label", "Quitar " + nombre);
        quitar.addEventListener("click", () => {
          i.cant--;
          if (i.cant <= 0) delete pedido[nombre];
          pintar();
        });
        li.append(txt, precio, quitar);
        lista.append(li);
      });
      document.getElementById("pedido-total").textContent = dinero(calcular().total);
      document.getElementById("btn-factura").disabled = items.length === 0;
    };

    document.querySelectorAll(".add").forEach(b => {
      b.addEventListener("click", () => {
        const n = b.dataset.nombre;
        pedido[n] = pedido[n] || { precio: parseFloat(b.dataset.precio), cant: 0 };
        pedido[n].cant++;
        pintar();
      });
    });

    document.getElementById("btn-vaciar").addEventListener("click", () => {
      Object.keys(pedido).forEach(k => delete pedido[k]);
      pintar();
    });

    const dlg = document.getElementById("factura");
    document.getElementById("btn-factura").addEventListener("click", () => {
      const cliente = document.getElementById("cliente").value.trim();
      const ahora = new Date();
      document.getElementById("f-meta").textContent =
        "Factura N.º " + String(Date.now()).slice(-6) + " · " +
        ahora.toLocaleDateString("es-PA") + " " +
        ahora.toLocaleTimeString("es-PA", { hour: "2-digit", minute: "2-digit" }) +
        (cliente ? " · Cliente: " + cliente : "");

      const cuerpo = document.getElementById("f-items");
      cuerpo.textContent = "";
      Object.entries(pedido).forEach(([nombre, i]) => {
        const tr = document.createElement("tr");
        [nombre, String(i.cant), dinero(i.precio * i.cant)].forEach(t => {
          const td = document.createElement("td");
          td.textContent = t;
          tr.append(td);
        });
        cuerpo.append(tr);
      });

      const t = calcular();
      document.getElementById("f-sub").textContent = dinero(t.sub);
      document.getElementById("f-imp").textContent = dinero(t.imp);
      document.getElementById("f-total").textContent = dinero(t.total);
      dlg.showModal();
    });

    document.getElementById("f-cerrar").addEventListener("click", () => dlg.close());
    document.getElementById("f-imprimir").addEventListener("click", () => window.print());
  }

  // 5. Validación del formulario de contacto (solo en contacto.html)
  const form = document.getElementById("form-contacto");
  if (!form) return;
  const mensajes = {
    nombre: "Escribe tu nombre (mínimo 3 letras).",
    correo: "Escribe un correo válido, por ejemplo nombre@correo.com.",
    telefono: "Usa solo 7 u 8 dígitos, sin guiones.",
    mensaje: "Cuéntanos más: mínimo 10 caracteres."
  };
  const validar = campo => {
    const ok = campo.value.trim() === "" && !campo.required
      ? true
      : campo.checkValidity() && campo.value.trim() !== "";
    campo.classList.toggle("invalido", !ok);
    campo.classList.toggle("valido", ok && campo.value !== "");
    document.getElementById("e-" + campo.name).textContent = ok ? "" : mensajes[campo.name];
    return ok;
  };
  const campos = [...form.querySelectorAll("input, textarea")];
  campos.forEach(c => c.addEventListener("blur", () => validar(c)));
  form.addEventListener("submit", e => {
    e.preventDefault();
    const todoOk = campos.map(validar).every(Boolean);
    const res = document.getElementById("resultado");
    if (todoOk) {
      res.textContent = "¡Gracias, " + form.nombre.value.trim() + "! Recibimos tu mensaje.";
      form.reset();
      campos.forEach(c => c.classList.remove("valido"));
    } else {
      res.textContent = "";
      campos.find(c => c.classList.contains("invalido")).focus();
    }
  });
});