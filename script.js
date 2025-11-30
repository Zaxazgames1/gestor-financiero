// Estado de la aplicación
let ingresoMensual = 0;
let gastos = [];
let mesActual = new Date();
let editandoGasto = null;
let chartInstance = null;

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    cargarDatos();
    actualizarMesActual();
    actualizarResumen();
    actualizarTabla();
    setFechaActual();
    
    // Event listener para el formulario
    document.getElementById('gastoForm').addEventListener('submit', function(e) {
        e.preventDefault();
        agregarGasto();
    });
});

// Establecer fecha actual por defecto
function setFechaActual() {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha').value = hoy;
}

// Funciones de Ingreso
function editarIngreso() {
    document.getElementById('ingresoDisplay').style.display = 'none';
    document.getElementById('ingresoEdit').style.display = 'flex';
    document.getElementById('inputIngreso').value = ingresoMensual;
    document.getElementById('inputIngreso').focus();
}

function guardarIngreso() {
    const valor = parseFloat(document.getElementById('inputIngreso').value) || 0;
    ingresoMensual = valor;
    document.getElementById('ingresoDisplay').textContent = formatCurrency(valor);
    document.getElementById('ingresoDisplay').style.display = 'block';
    document.getElementById('ingresoEdit').style.display = 'none';
    guardarDatos();
    actualizarResumen();
    mostrarNotificacion('Ingreso actualizado correctamente', '💰', 'success');
}

function cancelarIngreso() {
    document.getElementById('ingresoDisplay').style.display = 'block';
    document.getElementById('ingresoEdit').style.display = 'none';
}

// Funciones de Gastos
function agregarGasto() {
    if (editandoGasto !== null) {
        actualizarGasto();
        return;
    }

    const gasto = {
        id: Date.now(),
        nombre: document.getElementById('nombre').value.trim(),
        monto: parseFloat(document.getElementById('monto').value),
        fecha: document.getElementById('fecha').value,
        categoria: document.getElementById('categoria').value,
        recurrente: document.getElementById('recurrente').checked,
        pagado: false,
        mes: mesActual.getMonth(),
        año: mesActual.getFullYear()
    };

    gastos.push(gasto);
    guardarDatos();
    actualizarResumen();
    actualizarTabla();
    document.getElementById('gastoForm').reset();
    setFechaActual();
    
    mostrarNotificacion('Gasto agregado exitosamente', '✅', 'success');
}

function editarGastoRow(id) {
    const gasto = gastos.find(g => g.id === id);
    if (!gasto) return;

    editandoGasto = id;
    document.getElementById('nombre').value = gasto.nombre;
    document.getElementById('monto').value = gasto.monto;
    document.getElementById('fecha').value = gasto.fecha;
    document.getElementById('categoria').value = gasto.categoria;
    document.getElementById('recurrente').checked = gasto.recurrente;

    // Cambiar UI del formulario
    document.getElementById('formTitle').innerHTML = '<span class="title-icon">✏️</span> Editar Gasto';
    const btnSubmit = document.getElementById('btnSubmit');
    btnSubmit.innerHTML = '<span class="btn-icon">💾</span><span class="btn-text">Actualizar Gasto</span>';
    btnSubmit.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    document.getElementById('btnCancelForm').style.display = 'block';

    // Scroll al formulario
    document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function actualizarGasto() {
    const gasto = gastos.find(g => g.id === editandoGasto);
    if (!gasto) return;

    gasto.nombre = document.getElementById('nombre').value.trim();
    gasto.monto = parseFloat(document.getElementById('monto').value);
    gasto.fecha = document.getElementById('fecha').value;
    gasto.categoria = document.getElementById('categoria').value;
    gasto.recurrente = document.getElementById('recurrente').checked;

    cancelarEdicion();
    guardarDatos();
    actualizarResumen();
    actualizarTabla();

    mostrarNotificacion('Gasto actualizado correctamente', '✅', 'success');
}

function cancelarEdicion() {
    editandoGasto = null;
    document.getElementById('gastoForm').reset();
    setFechaActual();
    
    document.getElementById('formTitle').innerHTML = '<span class="title-icon">➕</span> Agregar Nuevo Gasto';
    const btnSubmit = document.getElementById('btnSubmit');
    btnSubmit.innerHTML = '<span class="btn-icon">➕</span><span class="btn-text">Agregar Gasto</span>';
    btnSubmit.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
    document.getElementById('btnCancelForm').style.display = 'none';
}

function eliminarGasto(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer.')) {
        gastos = gastos.filter(g => g.id !== id);
        guardarDatos();
        actualizarResumen();
        actualizarTabla();
        mostrarNotificacion('Gasto eliminado correctamente', '🗑️', 'success');
    }
}

function togglePagado(id) {
    const gasto = gastos.find(g => g.id === id);
    if (gasto) {
        gasto.pagado = !gasto.pagado;
        guardarDatos();
        actualizarResumen();
        actualizarTabla();
    }
}

// Funciones de Cálculo
function calcularTotal() {
    return gastosMesActual().reduce((sum, g) => sum + g.monto, 0);
}

function calcularPagado() {
    return gastosMesActual().filter(g => g.pagado).reduce((sum, g) => sum + g.monto, 0);
}

function calcularPendiente() {
    return gastosMesActual().filter(g => !g.pagado).reduce((sum, g) => sum + g.monto, 0);
}

function calcularBalance() {
    return ingresoMensual - calcularTotal();
}

function calcularPorCategoria() {
    const porCategoria = {};
    gastosMesActual().forEach(g => {
        if (!porCategoria[g.categoria]) {
            porCategoria[g.categoria] = 0;
        }
        porCategoria[g.categoria] += g.monto;
    });
    return porCategoria;
}

function gastosMesActual() {
    return gastos.filter(g => 
        g.mes === mesActual.getMonth() && 
        g.año === mesActual.getFullYear()
    );
}

function contarGastosPagados() {
    return gastosMesActual().filter(g => g.pagado).length;
}

function contarGastosPendientes() {
    return gastosMesActual().filter(g => !g.pagado).length;
}
// Actualizar UI
function actualizarResumen() {
    const total = calcularTotal();
    const pagado = calcularPagado();
    const pendiente = calcularPendiente();
    const balance = calcularBalance();
    const porcentaje = ingresoMensual > 0 ? ((total / ingresoMensual) * 100).toFixed(1) : 0;

    document.getElementById('totalGastos').textContent = formatCurrency(total);
    document.getElementById('porcentajeGastado').textContent = `${porcentaje}% del ingreso`;
    document.getElementById('balance').textContent = formatCurrency(balance);
    document.getElementById('totalPagado').textContent = formatCurrency(pagado);
    document.getElementById('totalPendiente').textContent = formatCurrency(pendiente);

    // Actualizar contadores
    document.getElementById('cantidadPagados').textContent = `${contarGastosPagados()} gastos`;
    document.getElementById('cantidadPendientes').textContent = `${contarGastosPendientes()} gastos`;

    // Actualizar color del balance
    const balanceCard = document.getElementById('balanceCard');
    const balanceStatus = document.getElementById('balanceStatus');
    if (balance >= 0) {
        balanceCard.className = 'summary-card balance';
        balanceStatus.textContent = 'Disponible';
        document.getElementById('balance').style.color = '#10b981';
    } else {
        balanceCard.className = 'summary-card red';
        balanceStatus.textContent = 'Déficit';
        document.getElementById('balance').style.color = '#ef4444';
    }

    // Actualizar categorías y gráfico
    actualizarCategorias();
    actualizarGrafico();
}

function actualizarCategorias() {
    const porCategoria = calcularPorCategoria();
    const total = calcularTotal();
    
    if (Object.keys(porCategoria).length === 0) {
        document.getElementById('categorySection').style.display = 'none';
        return;
    }

    document.getElementById('categorySection').style.display = 'block';
    const categoryGrid = document.getElementById('categoryGrid');
    categoryGrid.innerHTML = '';

    // Ordenar categorías por monto (mayor a menor)
    const categoriasOrdenadas = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]);

    categoriasOrdenadas.forEach(([categoria, monto]) => {
        const porcentaje = ((monto / total) * 100).toFixed(1);
        const item = document.createElement('div');
        item.className = 'category-item fade-in';
        item.innerHTML = `
            <div class="cat-name">${categoria}</div>
            <div class="cat-amount">${formatCurrency(monto)}</div>
            <div class="cat-percent">${porcentaje}% del total</div>
        `;
        categoryGrid.appendChild(item);
    });
}

function actualizarGrafico() {
    const porCategoria = calcularPorCategoria();
    
    if (Object.keys(porCategoria).length === 0) {
        document.getElementById('chartSection').style.display = 'none';
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
        return;
    }

    document.getElementById('chartSection').style.display = 'block';

    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    // Destruir gráfico anterior si existe
    if (chartInstance) {
        chartInstance.destroy();
    }

    const labels = Object.keys(porCategoria);
    const data = Object.values(porCategoria);
    const total = data.reduce((sum, val) => sum + val, 0);

    // Colores vibrantes para el gráfico
    const colores = [
        '#667eea', '#764ba2', '#f093fb', '#4facfe',
        '#43e97b', '#fa709a', '#fee140', '#30cfd0',
        '#a8edea', '#fed6e3', '#c471f5', '#f7971e'
    ];

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colores.slice(0, labels.length),
                borderWidth: 3,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 13,
                            weight: '600',
                            family: "'Inter', sans-serif"
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 15,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const porcentaje = ((value / total) * 100).toFixed(1);
                            return `${label}: ${formatCurrency(value)} (${porcentaje}%)`;
                        }
                    }
                }
            }
        }
    });
}

function actualizarTabla() {
    const gastosDelMes = gastosMesActual();
    const tableContainer = document.getElementById('tableContainer');
    const btnExport = document.getElementById('btnExport');

    if (gastosDelMes.length === 0) {
        tableContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💸</div>
                <p class="empty-title">No hay gastos registrados en este mes</p>
                <small class="empty-subtitle">Comienza agregando tu primer gasto usando el formulario de arriba</small>
            </div>
        `;
        btnExport.disabled = true;
        return;
    }

    btnExport.disabled = false;

    // Ordenar gastos por fecha (más reciente primero)
    const gastosOrdenados = gastosDelMes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const table = document.createElement('table');
    table.className = 'expense-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Nombre</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            ${gastosOrdenados.map(g => `
                <tr class="fade-in">
                    <td><strong>${g.nombre}</strong></td>
                    <td><strong>${formatCurrency(g.monto)}</strong></td>
                    <td>${formatDate(g.fecha)}</td>
                    <td><span class="category-badge badge-${g.categoria.toLowerCase()}">${g.categoria}</span></td>
                    <td><span class="type-badge ${g.recurrente ? 'badge-recurrente' : 'badge-unico'}">${g.recurrente ? '🔄 Recurrente' : '📌 Único'}</span></td>
                    <td>
                        <button class="status-btn ${g.pagado ? 'status-pagado' : 'status-pendiente'}" onclick="togglePagado(${g.id})">
                            ${g.pagado ? '✅ Pagado' : '⏳ Pendiente'}
                        </button>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit-row" onclick="editarGastoRow(${g.id})" title="Editar">✏️</button>
                            <button class="btn-delete" onclick="eliminarGasto(${g.id})" title="Eliminar">🗑️</button>
                        </div>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;

    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
}

// Funciones de Mes
function actualizarMesActual() {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('mesActual').textContent = 
        `${meses[mesActual.getMonth()]} ${mesActual.getFullYear()}`;
}

function cambiarMes(direccion) {
    mesActual.setMonth(mesActual.getMonth() + direccion);
    actualizarMesActual();
    actualizarResumen();
    actualizarTabla();
}

function volverHoy() {
    mesActual = new Date();
    actualizarMesActual();
    actualizarResumen();
    actualizarTabla();
    mostrarNotificacion('Regresaste al mes actual', '📍', 'success');
}

// Búsqueda de gastos
function buscarGastos() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('.expense-table tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Limpiar todos los datos
function limpiarDatos() {
    if (confirm('⚠️ ¿Estás seguro de que deseas eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
        if (confirm('🚨 ÚLTIMA CONFIRMACIÓN: Se eliminarán todos los gastos y el ingreso mensual. ¿Continuar?')) {
            gastos = [];
            ingresoMensual = 0;
            localStorage.clear();
            document.getElementById('ingresoDisplay').textContent = '$0';
            actualizarResumen();
            actualizarTabla();
            mostrarNotificacion('Todos los datos han sido eliminados', '🗑️', 'success');
        }
    }
}

// Exportar Excel Avanzado con XLSX y COLORES
function exportarExcelAvanzado() {
    const gastosDelMes = gastosMesActual();
    if (gastosDelMes.length === 0) {
        mostrarNotificacion('No hay gastos para exportar', '⚠️', 'error');
        return;
    }

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();

    // === HOJA 1: RESUMEN FINANCIERO ===
    const resumenData = [
        ['RESUMEN FINANCIERO MENSUAL'],
        [''],
        ['Mes:', mesActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()],
        ['Fecha de Exportación:', new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })],
        [''],
        ['INDICADORES PRINCIPALES'],
        ['Concepto', 'Valor (COP)'],
        ['Ingreso Mensual', ingresoMensual],
        ['Total Gastos', calcularTotal()],
        ['Balance', calcularBalance()],
        ['Pagado', calcularPagado()],
        ['Pendiente', calcularPendiente()],
        [''],
        ['ANÁLISIS PORCENTUAL'],
        ['% Gastado del Ingreso', parseFloat((calcularTotal() / ingresoMensual * 100).toFixed(2))],
        ['% Pagado del Total', parseFloat((calcularPagado() / calcularTotal() * 100).toFixed(2))],
        ['% Pendiente del Total', parseFloat((calcularPendiente() / calcularTotal() * 100).toFixed(2))],
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    
    // Estilos y colores para Resumen
    wsResumen['!cols'] = [{ wch: 30 }, { wch: 20 }];
    wsResumen['!rows'] = [
        { hpt: 25 }, // Título
        { hpt: 5 },
        { hpt: 18 },
        { hpt: 18 },
        { hpt: 5 },
        { hpt: 20 }, // Subtítulo
        { hpt: 18 }
    ];

    // Aplicar estilos a celdas específicas
    // Título principal (A1)
    if (wsResumen['A1']) {
        wsResumen['A1'].s = {
            font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "667EEA" } },
            alignment: { horizontal: "center", vertical: "center" }
        };
    }

    // Subtítulo "INDICADORES PRINCIPALES" (A6)
    if (wsResumen['A6']) {
        wsResumen['A6'].s = {
            font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "764BA2" } },
            alignment: { horizontal: "center", vertical: "center" }
        };
    }

    // Encabezados (A7, B7)
    ['A7', 'B7'].forEach(cell => {
        if (wsResumen[cell]) {
            wsResumen[cell].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "8B5CF6" } },
                alignment: { horizontal: "center", vertical: "center" }
            };
        }
    });

    // Valores monetarios con colores
    const valoresCeldas = {
        'B8': { color: '667EEA' }, // Ingreso (azul)
        'B9': { color: 'EF4444' }, // Total Gastos (rojo)
        'B10': { color: calcularBalance() >= 0 ? '10B981' : 'EF4444' }, // Balance
        'B11': { color: '10B981' }, // Pagado (verde)
        'B12': { color: 'F59E0B' }  // Pendiente (naranja)
    };

    Object.entries(valoresCeldas).forEach(([celda, config]) => {
        if (wsResumen[celda]) {
            wsResumen[celda].s = {
                font: { bold: true, sz: 11, color: { rgb: config.color } },
                alignment: { horizontal: "right" },
                numFmt: '#,##0'
            };
        }
    });

    // Subtítulo "ANÁLISIS PORCENTUAL" (A14)
    if (wsResumen['A14']) {
        wsResumen['A14'].s = {
            font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "764BA2" } },
            alignment: { horizontal: "center", vertical: "center" }
        };
    }

    // Porcentajes
    ['B15', 'B16', 'B17'].forEach(cell => {
        if (wsResumen[cell]) {
            wsResumen[cell].s = {
                font: { bold: true, color: { rgb: "8B5CF6" } },
                alignment: { horizontal: "right" },
                numFmt: '0.00"%"'
            };
        }
    });

    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    // === HOJA 2: GASTOS POR CATEGORÍA ===
    const porCategoria = calcularPorCategoria();
    const total = calcularTotal();
    
    const categoriaData = [
        ['ANÁLISIS POR CATEGORÍA'],
        [''],
        ['Categoría', 'Monto (COP)', '% del Total', 'Cantidad'],
    ];

    const coloresCategoria = {
        'Servicios': 'DBEAFE',
        'Alimentación': 'D1FAE5',
        'Transporte': 'FEF3C7',
        'Vivienda': 'E9D5FF',
        'Salud': 'FEE2E2',
        'Entretenimiento': 'FCE7F3',
        'Educación': 'E0E7FF',
        'Ahorro': 'CCFBF1',
        'Ropa': 'FCE7F3',
        'Imprevistos': 'FED7AA',
        'Otros': 'F3F4F6'
    };

    const categoriasOrdenadas = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]);
    
    categoriasOrdenadas.forEach(([cat, monto]) => {
        const porcentaje = parseFloat(((monto / total) * 100).toFixed(2));
        const cantidad = gastosDelMes.filter(g => g.categoria === cat).length;
        categoriaData.push([cat, monto, porcentaje, cantidad]);
    });

    categoriaData.push(['']);
    categoriaData.push(['TOTALES', total, 100, gastosDelMes.length]);

    const wsCategoria = XLSX.utils.aoa_to_sheet(categoriaData);
    wsCategoria['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 15 }, { wch: 15 }];

    // Estilos para Categoría
    // Título
    if (wsCategoria['A1']) {
        wsCategoria['A1'].s = {
            font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "667EEA" } },
            alignment: { horizontal: "center", vertical: "center" }
        };
    }

    // Encabezados
    ['A3', 'B3', 'C3', 'D3'].forEach(cell => {
        if (wsCategoria[cell]) {
            wsCategoria[cell].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "8B5CF6" } },
                alignment: { horizontal: "center", vertical: "center" }
            };
        }
    });

    // Colorear filas de categorías
    categoriasOrdenadas.forEach(([cat, monto], index) => {
        const fila = index + 4; // Empieza en fila 4
        const color = coloresCategoria[cat] || 'F3F4F6';
        
        ['A', 'B', 'C', 'D'].forEach(col => {
            const celda = `${col}${fila}`;
            if (wsCategoria[celda]) {
                wsCategoria[celda].s = {
                    fill: { fgColor: { rgb: color } },
                    font: { bold: col === 'A' },
                    alignment: { horizontal: col === 'A' ? "left" : "center" }
                };
                
                // Formato numérico
                if (col === 'B') wsCategoria[celda].s.numFmt = '#,##0';
                if (col === 'C') wsCategoria[celda].s.numFmt = '0.00"%"';
            }
        });
    });

    // Fila de totales
    const filaTotales = categoriasOrdenadas.length + 5;
    ['A', 'B', 'C', 'D'].forEach(col => {
        const celda = `${col}${filaTotales}`;
        if (wsCategoria[celda]) {
            wsCategoria[celda].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "764BA2" } },
                alignment: { horizontal: "center", vertical: "center" }
            };
            if (col === 'B') wsCategoria[celda].s.numFmt = '#,##0';
            if (col === 'C') wsCategoria[celda].s.numFmt = '0.00"%"';
        }
    });

    XLSX.utils.book_append_sheet(wb, wsCategoria, 'Por Categoría');

    // === HOJA 3: DETALLE DE GASTOS ===
    const detalleData = [
        ['DETALLE COMPLETO DE GASTOS'],
        [''],
        ['Nombre', 'Monto (COP)', 'Fecha', 'Categoría', 'Tipo', 'Estado'],
    ];

    const gastosOrdenados = gastosDelMes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    gastosOrdenados.forEach(g => {
        detalleData.push([
            g.nombre,
            g.monto,
            g.fecha,
            g.categoria,
            g.recurrente ? 'Recurrente' : 'Único',
            g.pagado ? 'Pagado' : 'Pendiente'
        ]);
    });

    const wsDetalle = XLSX.utils.aoa_to_sheet(detalleData);
    wsDetalle['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 12 }];

    // Estilos para Detalle
    // Título
    if (wsDetalle['A1']) {
        wsDetalle['A1'].s = {
            font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "667EEA" } },
            alignment: { horizontal: "center", vertical: "center" }
        };
    }

    // Encabezados
    ['A3', 'B3', 'C3', 'D3', 'E3', 'F3'].forEach(cell => {
        if (wsDetalle[cell]) {
            wsDetalle[cell].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "8B5CF6" } },
                alignment: { horizontal: "center", vertical: "center" }
            };
        }
    });

    // Colorear filas de gastos alternadas
    gastosOrdenados.forEach((g, index) => {
        const fila = index + 4;
        const colorFila = index % 2 === 0 ? 'F9FAFB' : 'FFFFFF';
        const colorEstado = g.pagado ? 'D1FAE5' : 'FED7AA';
        
        ['A', 'B', 'C', 'D', 'E'].forEach(col => {
            const celda = `${col}${fila}`;
            if (wsDetalle[celda]) {
                wsDetalle[celda].s = {
                    fill: { fgColor: { rgb: colorFila } },
                    alignment: { horizontal: col === 'B' ? "right" : "left" }
                };
                if (col === 'B') wsDetalle[celda].s.numFmt = '#,##0';
            }
        });
        
        // Columna de estado con color especial
        const celdaEstado = `F${fila}`;
        if (wsDetalle[celdaEstado]) {
            wsDetalle[celdaEstado].s = {
                fill: { fgColor: { rgb: colorEstado } },
                font: { bold: true, color: { rgb: g.pagado ? "065F46" : "92400E" } },
                alignment: { horizontal: "center", vertical: "center" }
            };
        }
    });

    XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle de Gastos');

    // === HOJA 4: GASTOS RECURRENTES ===
    const recurrentes = gastosDelMes.filter(g => g.recurrente);
    
    if (recurrentes.length > 0) {
        const recurrentesData = [
            ['GASTOS RECURRENTES MENSUALES'],
            [''],
            ['Nombre', 'Monto (COP)', 'Categoría', 'Estado'],
        ];

        recurrentes.forEach(g => {
            recurrentesData.push([
                g.nombre,
                g.monto,
                g.categoria,
                g.pagado ? 'Pagado' : 'Pendiente'
            ]);
        });

        recurrentesData.push(['']);
        recurrentesData.push(['TOTAL RECURRENTES', recurrentes.reduce((sum, g) => sum + g.monto, 0), '', '']);

        const wsRecurrentes = XLSX.utils.aoa_to_sheet(recurrentesData);
        wsRecurrentes['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 20 }, { wch: 12 }];

        // Estilos para Recurrentes
        if (wsRecurrentes['A1']) {
            wsRecurrentes['A1'].s = {
                font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "667EEA" } },
                alignment: { horizontal: "center", vertical: "center" }
            };
        }

        ['A3', 'B3', 'C3', 'D3'].forEach(cell => {
            if (wsRecurrentes[cell]) {
                wsRecurrentes[cell].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "8B5CF6" } },
                    alignment: { horizontal: "center", vertical: "center" }
                };
            }
        });

        recurrentes.forEach((g, index) => {
            const fila = index + 4;
            const colorEstado = g.pagado ? 'D1FAE5' : 'FED7AA';
            
            ['A', 'B', 'C'].forEach(col => {
                const celda = `${col}${fila}`;
                if (wsRecurrentes[celda]) {
                    wsRecurrentes[celda].s = {
                        fill: { fgColor: { rgb: 'E9D5FF' } },
                        alignment: { horizontal: col === 'B' ? "right" : "left" }
                    };
                    if (col === 'B') wsRecurrentes[celda].s.numFmt = '#,##0';
                }
            });
            
            const celdaEstado = `D${fila}`;
            if (wsRecurrentes[celdaEstado]) {
                wsRecurrentes[celdaEstado].s = {
                    fill: { fgColor: { rgb: colorEstado } },
                    font: { bold: true, color: { rgb: g.pagado ? "065F46" : "92400E" } },
                    alignment: { horizontal: "center", vertical: "center" }
                };
            }
        });

        // Fila de total
        const filaTotalRec = recurrentes.length + 5;
        ['A', 'B'].forEach(col => {
            const celda = `${col}${filaTotalRec}`;
            if (wsRecurrentes[celda]) {
                wsRecurrentes[celda].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "764BA2" } },
                    alignment: { horizontal: "center", vertical: "center" }
                };
                if (col === 'B') wsRecurrentes[celda].s.numFmt = '#,##0';
            }
        });

        XLSX.utils.book_append_sheet(wb, wsRecurrentes, 'Gastos Recurrentes');
    }

    // === HOJA 5: ANÁLISIS ESTADÍSTICO ===
    const analisisData = [
        ['ANÁLISIS ESTADÍSTICO DETALLADO'],
        [''],
        ['DISTRIBUCIÓN POR CATEGORÍA'],
        ['Categoría', 'Monto', 'Porcentaje', 'Promedio por Gasto'],
    ];

    categoriasOrdenadas.forEach(([cat, monto]) => {
        const porcentaje = parseFloat(((monto / total) * 100).toFixed(2));
        const cantidad = gastosDelMes.filter(g => g.categoria === cat).length;
        const promedio = parseFloat((monto / cantidad).toFixed(2));
        analisisData.push([cat, monto, porcentaje, promedio]);
    });

    analisisData.push(['']);
    analisisData.push(['ESTADÍSTICAS GENERALES']);
    analisisData.push(['Métrica', 'Valor']);
    analisisData.push(['Total de gastos registrados', gastosDelMes.length]);
    analisisData.push(['Gasto promedio', parseFloat((total / gastosDelMes.length).toFixed(2))]);
    analisisData.push(['Gasto más alto', Math.max(...gastosDelMes.map(g => g.monto))]);
    analisisData.push(['Gasto más bajo', Math.min(...gastosDelMes.map(g => g.monto))]);
    analisisData.push(['']);
    analisisData.push(['INFORMACIÓN ADICIONAL']);
    analisisData.push(['Categoría con mayor gasto', categoriasOrdenadas[0][0]]);
    analisisData.push(['Gastos recurrentes', recurrentes.length]);
    analisisData.push(['Gastos únicos', gastosDelMes.length - recurrentes.length]);
    analisisData.push(['Tasa de pago', parseFloat(((contarGastosPagados() / gastosDelMes.length) * 100).toFixed(2))]);

    const wsAnalisis = XLSX.utils.aoa_to_sheet(analisisData);
    wsAnalisis['!cols'] = [{ wch: 35 }, { wch: 18 }, { wch: 15 }, { wch: 22 }];

    // Estilos para Análisis
    if (wsAnalisis['A1']) {
        wsAnalisis['A1'].s = {
            font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "667EEA" } },
            alignment: { horizontal: "center", vertical: "center" }
        };
    }

    if (wsAnalisis['A3']) {
        wsAnalisis['A3'].s = {
            font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "764BA2" } },
            alignment: { horizontal: "center", vertical: "center" }
        };
    }

    ['A4', 'B4', 'C4', 'D4'].forEach(cell => {
        if (wsAnalisis[cell]) {
            wsAnalisis[cell].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "8B5CF6" } },
                alignment: { horizontal: "center", vertical: "center" }
            };
        }
    });

    // Colorear datos de categorías
    categoriasOrdenadas.forEach(([cat], index) => {
        const fila = index + 5;
        const color = coloresCategoria[cat] || 'F3F4F6';
        
        ['A', 'B', 'C', 'D'].forEach(col => {
            const celda = `${col}${fila}`;
            if (wsAnalisis[celda]) {
                wsAnalisis[celda].s = {
                    fill: { fgColor: { rgb: color } },
                    alignment: { horizontal: col === 'A' ? "left" : "center" }
                };
                if (col === 'B' || col === 'D') wsAnalisis[celda].s.numFmt = '#,##0';
                if (col === 'C') wsAnalisis[celda].s.numFmt = '0.00"%"';
            }
        });
    });

    // Sección de estadísticas
    const filaEstadisticas = categoriasOrdenadas.length + 6;
    if (wsAnalisis[`A${filaEstadisticas}`]) {
        wsAnalisis[`A${filaEstadisticas}`].s = {
            font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "764BA2" } },
            alignment: { horizontal: "center", vertical: "center" }
        };
    }

    ['A', 'B'].forEach(col => {
        const celda = `${col}${filaEstadisticas + 1}`;
        if (wsAnalisis[celda]) {
            wsAnalisis[celda].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "8B5CF6" } },
                alignment: { horizontal: "center", vertical: "center" }
            };
        }
    });

    // Colorear valores de estadísticas
    for (let i = 0; i < 4; i++) {
        const fila = filaEstadisticas + 2 + i;
        ['A', 'B'].forEach(col => {
            const celda = `${col}${fila}`;
            if (wsAnalisis[celda]) {
                wsAnalisis[celda].s = {
                    fill: { fgColor: { rgb: 'F0F9FF' } },
                    alignment: { horizontal: col === 'A' ? "left" : "right" }
                };
                if (col === 'B') wsAnalisis[celda].s.numFmt = '#,##0';
            }
        });
    }

    // Sección información adicional
    const filaInfo = filaEstadisticas + 7;
    if (wsAnalisis[`A${filaInfo}`]) {
        wsAnalisis[`A${filaInfo}`].s = {
            font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "764BA2" } },
            alignment: { horizontal: "center", vertical: "center" }
        };
    }

    for (let i = 0; i < 4; i++) {
        const fila = filaInfo + 1 + i;
        ['A', 'B'].forEach(col => {
            const celda = `${col}${fila}`;
            if (wsAnalisis[celda]) {
                wsAnalisis[celda].s = {
                    fill: { fgColor: { rgb: 'FEF3C7' } },
                    alignment: { horizontal: col === 'A' ? "left" : "center" },
                    font: { bold: col === 'B' }
                };
                if (col === 'B' && fila === filaInfo + 4) wsAnalisis[celda].s.numFmt = '0.00"%"';
            }
        });
    }

    XLSX.utils.book_append_sheet(wb, wsAnalisis, 'Análisis Estadístico');

    // Generar y descargar archivo
    const nombreArchivo = `Finanzas_Pro_${mesActual.getFullYear()}_${(mesActual.getMonth() + 1).toString().padStart(2, '0')}.xlsx`;
    
    XLSX.writeFile(wb, nombreArchivo);

    mostrarNotificacion('Excel Pro exportado con colores y formato profesional', '📥', 'success');
}

// Persistencia de datos
function guardarDatos() {
    localStorage.setItem('ingresoMensual', ingresoMensual);
    localStorage.setItem('gastos', JSON.stringify(gastos));
    localStorage.setItem('ultimaActualizacion', new Date().toISOString());
}

function cargarDatos() {
    const ingresoGuardado = localStorage.getItem('ingresoMensual');
    if (ingresoGuardado) {
        ingresoMensual = parseFloat(ingresoGuardado);
        document.getElementById('ingresoDisplay').textContent = formatCurrency(ingresoMensual);
    }

    const gastosGuardados = localStorage.getItem('gastos');
    if (gastosGuardados) {
        gastos = JSON.parse(gastosGuardados);
    }
}

// Utilidades
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatNumber(amount) {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
}

function mostrarNotificacion(mensaje, icono = '✅', tipo = 'success') {
    // Crear notificación
    const notif = document.createElement('div');
    notif.className = `notification ${tipo}`;
    notif.innerHTML = `
        <div class="notification-icon">${icono}</div>
        <div class="notification-content">
            <div class="notification-title">${tipo === 'success' ? 'Éxito' : 'Aviso'}</div>
            <div class="notification-message">${mensaje}</div>
        </div>
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => notif.remove(), 400);
    }, 3000);
}

// Atajos de teclado
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S para guardar ingreso (si está editando)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const ingresoEdit = document.getElementById('ingresoEdit');
        if (ingresoEdit.style.display !== 'none') {
            guardarIngreso();
        }
    }
    
    // Ctrl/Cmd + E para exportar Excel
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (gastosMesActual().length > 0) {
            exportarExcelAvanzado();
        }
    }
    
    // ESC para cancelar edición
    if (e.key === 'Escape') {
        if (editandoGasto !== null) {
            cancelarEdicion();
        }
    }
});

// Auto-guardado cada 30 segundos
setInterval(guardarDatos, 30000);

console.log('💰 Gestor Financiero Personal Pro - Cargado correctamente');
console.log('Atajos de teclado:');
console.log('- Ctrl/Cmd + S: Guardar ingreso');
console.log('- Ctrl/Cmd + E: Exportar a Excel');
console.log('- ESC: Cancelar edición');
```

---

## 🎉 ¡Listo! Instrucciones finales:

### 📂 Estructura de archivos:
```
