<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-slate-100 to-blue-50 p-6">

    <!-- 🔘 Botón de cerrar sesión -->
    <div class="flex justify-end mb-4">
      <button @click="cerrarSesion"
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-4 py-2 rounded-md transition">
        Cerrar sesión
      </button>
    </div>

    <!-- 🔳 Grid de columnas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

      <!-- Pendientes -->
      <section>
        <h3 class="text-lg font-semibold text-blue-800 mb-3 text-center">Pendientes</h3>
        <div v-if="pendientes.length > 0" class="space-y-3">
          <div v-for="traslado in pendientes" :key="traslado.id"
               :class="['bg-white p-4 rounded-lg border-2 shadow cursor-pointer transition hover:shadow-md', getPriorityBorderClass(traslado.prioridad)]"
               @click="toggleExpand(traslado)">
            <p><strong>Ubicación:</strong> {{ traslado.ubicacion }}</p>
            <p><strong>Habitación del paciente:</strong> {{ traslado.habitacion_actual }}</p>
            <p><strong>Destino:</strong> {{ traslado.destino }}</p>
            <p><strong>Habitación de destino:</strong> {{ traslado.habitacion_destino }}</p>
            <p><strong>Celador:</strong> {{ traslado.celador_id || 'Sin asignar' }}</p>
            <p><strong>Hora de Envío:</strong> {{ traslado.hora_envio }}</p>
            <p>
              <strong>Prioridad:</strong>
              <span :class="getPriorityColorClass(traslado.prioridad)" class="inline-block rounded w-10 h-3 ml-2"></span>
            </p>

            <div v-if="traslado.expandido" class="mt-2 text-sm text-gray-700 space-y-1">
              <p><strong>Motivo:</strong> {{ traslado.motivo }}</p>
              <p><strong>Condiciones:</strong>
                {{ traslado.condiciones && traslado.condiciones.length > 0 ? traslado.condiciones.join(', ') : 'Ninguna' }}
              </p>
              <p><strong>Aislamiento:</strong> {{ traslado.aislamiento }}</p>
              <p><strong>Prioridad:</strong> {{ traslado.prioridad }}</p>
            </div>
          </div>
        </div>
        <p v-else class="text-center text-gray-500">Sin traslados</p>
      </section>

      <!-- En Curso -->
      <section>
        <h3 class="text-lg font-semibold text-blue-700 mb-3 text-center">En Curso</h3>
        <div v-if="aceptados.length > 0" class="space-y-3">
          <div v-for="traslado in aceptados" :key="traslado.id"
               :class="['bg-white p-4 rounded-lg border-2 shadow cursor-pointer transition hover:shadow-md', getPriorityBorderClass(traslado.prioridad)]"
               @click="toggleExpand(traslado)">
            <p><strong>Ubicación:</strong> {{ traslado.ubicacion }}</p>
            <p><strong>Habitación del paciente:</strong> {{ traslado.habitacion_actual }}</p>
            <p><strong>Destino:</strong> {{ traslado.destino }}</p>
            <p><strong>Habitación de destino:</strong> {{ traslado.habitacion_destino }}</p>
            <p><strong>Celador:</strong> {{ traslado.celador_id || 'Sin asignar' }}</p>
            <p><strong>Hora de Envío:</strong> {{ traslado.hora_envio }}</p>
            <p><strong>Hora de Aceptación:</strong> {{ traslado.hora_aceptado || 'No aceptado' }}</p>
            <p>
                <strong>Prioridad:</strong>
                <span :class="getPriorityColorClass(traslado.prioridad)" class="inline-block rounded w-10 h-3 ml-2"></span>
              </p>

            <div v-if="traslado.expandido" class="mt-2 text-sm text-gray-700 space-y-1">
              <p><strong>Motivo:</strong> {{ traslado.motivo }}</p>
              <p><strong>Condiciones:</strong>
                {{ traslado.condiciones && traslado.condiciones.length > 0 ? traslado.condiciones.join(', ') : 'Ninguna' }}
              </p>
              <p><strong>Aislamiento:</strong> {{ traslado.aislamiento }}</p>
              <p><strong>Prioridad:</strong> {{ traslado.prioridad }}</p>
            </div>
          </div>
        </div>
        <p v-else class="text-center text-gray-500">Sin traslados</p>
      </section>

      <!-- Finalizados -->
      <section>
        <h3 class="text-lg font-semibold text-blue-800 mb-3 text-center">Finalizados</h3>
        <div v-if="finalizados.length > 0" class="space-y-3">
          <div v-for="traslado in finalizados" :key="traslado.id"
               :class="['bg-white p-4 rounded-lg border-2 shadow cursor-pointer transition hover:shadow-md', getPriorityBorderClass(traslado.prioridad)]"
               @click="toggleExpand(traslado)">
            <p><strong>Ubicación:</strong> {{ traslado.ubicacion }}</p>
            <p><strong>Habitación del paciente:</strong> {{ traslado.habitacion_actual }}</p>
            <p><strong>Destino:</strong> {{ traslado.destino }}</p>
            <p><strong>Habitación de destino:</strong> {{ traslado.habitacion_destino }}</p>
            <p><strong>Celador:</strong> {{ traslado.celador_id || 'Sin asignar' }}</p>
            <p><strong>Hora de Envío:</strong> {{ traslado.hora_envio }}</p>
            <p><strong>Hora de Aceptación:</strong> {{ traslado.hora_aceptado || 'No aceptado' }}</p>
            <p><strong>Hora de Finalización:</strong> {{ traslado.hora_finalizado || 'No finalizado' }}</p>
            <p>
                <strong>Prioridad:</strong>
                <span :class="getPriorityColorClass(traslado.prioridad)" class="inline-block rounded w-10 h-3 ml-2"></span>
              </p>

            <div v-if="traslado.expandido" class="mt-2 text-sm text-gray-700 space-y-1">
              <p><strong>Motivo:</strong> {{ traslado.motivo }}</p>
              <p><strong>Condiciones:</strong>
                {{ traslado.condiciones && traslado.condiciones.length > 0 ? traslado.condiciones.join(', ') : 'Ninguna' }}
              </p>
              <p><strong>Aislamiento:</strong> {{ traslado.aislamiento }}</p>
              <p><strong>Prioridad:</strong> {{ traslado.prioridad }}</p>
            </div>
          </div>
        </div>
        <p v-else class="text-center text-gray-500">Sin traslados</p>
      </section>

    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pendientes: [],
      aceptados: [],
      finalizados: [],
      socket: null,
      jefeId: "JEFE_1"
    };
  },
  mounted() {
    this.conectarWebSocket();
    this.cargarTraslados();
  },
  methods: {
    conectarWebSocket() {
      this.socket = new WebSocket("ws://localhost:3000");

      this.socket.onopen = () => {
        console.log("WebSocket conectado como jefe");
        this.socket.send(JSON.stringify({ type: "register_jefe", id: this.jefeId }));
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "actualizar_traslados") {
          this.cargarTraslados();
        }

        if (data.type === "traslado_actualizado") {
          this.actualizarTrasladoEnPantalla(data.traslado);
        }
      };

      this.socket.onclose = () => {
        console.log("WebSocket cerrado, reconectando en 2s...");
        setTimeout(this.conectarWebSocket, 2000);
      };

      this.socket.onerror = (error) => {
        console.error("Error en WebSocket:", error);
        this.socket.close();
      };
    },
    cargarTraslados() {
      fetch("http://localhost:3000/traslados/pendientes")
        .then(res => res.json())
        .then(data => {
          this.pendientes = data.map(t => ({ ...t, expandido: false }));
        });

      fetch("http://localhost:3000/traslados/aceptados")
        .then(res => res.json())
        .then(data => {
          this.aceptados = data.map(t => ({ ...t, expandido: false }));
        });

      fetch("http://localhost:3000/traslados/finalizados")
        .then(res => res.json())
        .then(data => {
          this.finalizados = data.map(t => ({ ...t, expandido: false }));
        });
    },
    actualizarTrasladoEnPantalla(trasladoActualizado) {
  // Eliminar traslado de todas las listas
  const quitarDeLista = (lista) => {
    const index = lista.findIndex(t => t.id === trasladoActualizado.id);
    if (index !== -1) lista.splice(index, 1);
  };

  quitarDeLista(this.pendientes);
  quitarDeLista(this.aceptados);
  quitarDeLista(this.finalizados);

  // Añadir a la lista correspondiente
  const nuevo = { ...trasladoActualizado, expandido: false };

  if (trasladoActualizado.estado === "pendiente") {
    this.pendientes.push(nuevo);
  } else if (trasladoActualizado.estado === "aceptado") {
    this.aceptados.push(nuevo);
  } else if (trasladoActualizado.estado === "finalizado") {
    this.finalizados.push(nuevo);
  }
}
,
    toggleExpand(traslado) {
      traslado.expandido = !traslado.expandido;
    },
    cerrarSesion() {
      if (this.socket) this.socket.close();
      this.$router.push("/");
    },
    getPriorityColorClass(prioridad) {
      switch (prioridad) {
        case 'Alta':
          return 'bg-red-500';
        case 'Media':
          return 'bg-yellow-500';
        case 'Baja':
          return 'bg-green-500';
        default:
          return 'bg-gray-500';
      }
    },
    getPriorityBorderClass(prioridad) {
      switch (prioridad) {
        case 'Alta':
          return 'border-red-500';
        case 'Media':
          return 'border-yellow-500';
        case 'Baja':
          return 'border-green-500';
        default:
          return 'border-gray-300';
      }
    }
  }
};
</script>

<style scoped>
/* Estética y transiciones ya incluidas por Tailwind */
</style>
