document.addEventListener('DOMContentLoaded', async () => {
  const nombre = sessionStorage.getItem('nombre');
  const cedula = sessionStorage.getItem('cedula');
  document.getElementById('nombreUsuario').textContent = nombre;

  // 🔽 Mostrar u ocultar filtros según el tipo
  const tipoFiltro = document.getElementById('tipoFiltro');
  const filtroUnico = document.getElementById('filtroFechaUnica');
  const filtroRango = document.getElementById('filtroRangoFechas');

  tipoFiltro.addEventListener('change', () => {
    if (tipoFiltro.value === 'fecha') {
      filtroUnico.style.display = 'block';
      filtroRango.style.display = 'none';
    } else {
      filtroUnico.style.display = 'none';
      filtroRango.style.display = 'block';
    }
  });

  // 🔽 Top 3
  try {
    const res = await fetch(`https://san-jose.onrender.com/api/estadisticas/${cedula}`);
    const top = await res.json();
    const contenedor = document.getElementById('topAtenciones1');
    contenedor.innerHTML = '';
    top.forEach((entry, index) => {
      const p = document.createElement('p');
      p.innerHTML = `<strong>${index + 1}. ${entry.nombre}</strong> - Promedio: ${entry.promedio}`;
      contenedor.appendChild(p);
    });

    const radarContainer = document.getElementById('topAtenciones');
    radarContainer.innerHTML = '<canvas id="graficoTop3Radar"></canvas>';
    const radarCtx = document.getElementById('graficoTop3Radar').getContext('2d');

    const colores = [
      { fondo: 'rgba(255, 99, 132, 0.2)', borde: 'rgb(255, 99, 132)' },
      { fondo: 'rgba(54, 162, 235, 0.2)', borde: 'rgb(54, 162, 235)' },
      { fondo: 'rgba(255, 206, 86, 0.2)', borde: 'rgb(255, 206, 86)' }
    ];

    const datasets = top.map((entry, index) => ({
      label: `${entry.nombre}`,
      data: [entry.promedio_puntualidad || 0, entry.promedio_trato || 0, entry.promedio_resolucion || 0],
      fill: true,
      backgroundColor: colores[index].fondo,
      borderColor: colores[index].borde,
      pointBackgroundColor: colores[index].borde,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: colores[index].borde
    }));

    new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels: ['Puntualidad', 'Trato', 'Resolución'],
        datasets
      },
      options: {
        elements: { line: { borderWidth: 1 } },
        plugins: {
          title: { display: true, text: 'Top 3 Mejores Calificados' },
          legend: { position: 'top' }
        },
        scales: {
          r: {
            min: 0,
            max: 5,
            stepSize: 1,
            angleLines: { color: 'rgba(0,0,0,0.6)', lineWidth: 1.5 },
            grid: { color: 'rgba(0,0,0,0.3)', lineWidth: 1.2 },
            pointLabels: { color: '#000', font: { size: 14, weight: 'bold' } },
            ticks: { color: '#000', backdropColor: 'transparent', font: { size: 12 } }
          }
        }
      }
    });
  } catch (err) {
    console.error(err);
    alert("Error al obtener estadísticas TOP.");
  }

  // 🔽 Estadísticas generales (dona)
  try {
    const res = await fetch(`https://san-jose.onrender.com/api/estadisticas/detalle/${cedula}`);
    const detalle = await res.json();

    document.getElementById('detalleUsuario').innerHTML = `
      <p><strong>Promedio de Puntualidad:</strong> ${detalle.promedio_puntualidad ?? 'N/A'}</p>
      <p><strong>Promedio de Trato:</strong> ${detalle.promedio_trato ?? 'N/A'}</p>
      <p><strong>Promedio de Resolución:</strong> ${detalle.promedio_resolucion ?? 'N/A'}</p>
    `;

    const ctx = document.getElementById('graficoGeneral').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Puntualidad', 'Trato', 'Resolución'],
        datasets: [{
          label: 'Promedio',
          data: [detalle.promedio_puntualidad || 0, detalle.promedio_trato || 0, detalle.promedio_resolucion || 0],
          backgroundColor: ['blue', 'green', 'orange']
        }]
      }
    });
  } catch (err) {
    console.error(err);
    alert("Error al obtener estadísticas generales.");
  }

  let graficoPastel = null;

  function mostrarDatosYGrafico(filtrado, titulo = 'Promedios') {
    const container = document.getElementById('estadisticasDiarias');
    container.innerHTML = `
      <strong>${titulo}:</strong>
      Puntualidad: ${filtrado.promedio_puntualidad} |
      Trato: ${filtrado.promedio_trato} |
      Resolución: ${filtrado.promedio_resolucion}
    `;

    const canvas = document.getElementById('graficoPastel');
    canvas.style.display = 'block';

    if (graficoPastel) {
      graficoPastel.destroy();
    }

    const ctx = canvas.getContext('2d');
    graficoPastel = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: ['Puntualidad', 'Trato', 'Resolución'],
        datasets: [{
          label: 'Promedio',
          data: [
            filtrado.promedio_puntualidad || 0,
            filtrado.promedio_trato || 0,
            filtrado.promedio_resolucion || 0
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 206, 86)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          r: { suggestedMin: 0, suggestedMax: 5 }
        }
      }
    });
  }

  async function mostrarEstadisticaPorFecha(fecha) {
  try {
    const res = await fetch(`https://san-jose.onrender.com/api/estadisticas/detalle/diario/${cedula}`);
    const dias = await res.json();

    const fechaFormateada = new Date(fecha).toISOString().slice(0, 10);

    const dato = dias.find(d => {
      const fechaDia = new Date(d.fecha).toISOString().slice(0, 10);
      return fechaDia === fechaFormateada;
    });

    if (dato) {
      mostrarDatosYGrafico(dato, fechaFormateada);
    } else {
      document.getElementById('estadisticasDiarias').innerHTML = '<p>No hay datos para esta fecha.</p>';
      document.getElementById('graficoPastel').style.display = 'none';
      if (graficoPastel) graficoPastel.destroy();
    }
  } catch (err) {
    console.error(err);
    alert('Error al filtrar por fecha.');
  }
}



  // 🔽 Botón FILTRAR
  document.getElementById('filtrarBtn').addEventListener('click', async () => {
    if (tipoFiltro.value === 'fecha') {
      const fecha = document.getElementById('fechaFiltro').value;
      if (!fecha) return alert('Selecciona una fecha');
      mostrarEstadisticaPorFecha(fecha);
    } else {
      const desde = document.getElementById('fechaInicoo').value;
      const hasta = document.getElementById('fechaFin').value;
      if (!desde || !hasta) return alert('Selecciona ambas fechas');

      try {
        const res = await fetch(`https://san-jose.onrender.com/api/estadisticas/detalle/promedio/${cedula}?desde=${desde}&hasta=${hasta}`);
        const data = await res.json();

        if (!data || (!data.promedio_puntualidad && !data.promedio_trato && !data.promedio_resolucion)) {
          document.getElementById('estadisticasDiarias').innerHTML = '<p>No hay datos para este rango.</p>';
          document.getElementById('graficoPastel').style.display = 'none';
          if (graficoPastel) graficoPastel.destroy();
        } else {
          mostrarDatosYGrafico(data, `Promedio del ${desde} al ${hasta}`);
        }
      } catch (err) {
        console.error(err);
        alert('Error al filtrar por rango de fechas.');
      }
    }
  });

  // 🔽 Valor por defecto (hoy)
  document.getElementById('fechaFiltro').value = new Date().toISOString().slice(0, 10);
});