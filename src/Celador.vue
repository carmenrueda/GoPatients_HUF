<template>
  <div>
    <div v-if="notificacion"
         class="fixed top-4 right-4 bg-blue-700 text-white px-4 py-2 rounded shadow-md animate-fade z-50">
      {{ notificacion }}
    </div>

    <div class="min-h-screen bg-gradient-to-br from-white via-slate-100 to-blue-50 px-4 py-8">
      <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        <h3 class="text-2xl font-bold text-blue-800 mb-6 text-center">Traslados Pendientes</h3>

        <div v-if="traslados.length > 0" class="space-y-6">
          <div v-for="traslado in traslados" :key="traslado.id"
          :class="['p-4 bg-slate-50 rounded-lg shadow-sm border-2', getPriorityBorderClass(traslado.prioridad)]">
            <div class="space-y-1">
              <p><span class="font-semibold text-gray-700">Hora de Envío:</span> {{ traslado.hora_envio }}</p>
              <p><span class="font-semibold text-gray-700">Ubicación del paciente:</span> {{ traslado.ubicacion }}</p>
              <p><span class="font-semibold text-gray-700">Habitación del paciente:</span> {{ traslado.habitacion_actual }}</p>
              <p><span class="font-semibold text-gray-700">Destino:</span> {{ traslado.destino }}</p>
              <p><span class="font-semibold text-gray-700">Habitación de destino:</span> {{ traslado.habitacion_destino }}</p>
              <p>
                <span class="font-semibold text-gray-700">Prioridad:</span>
                <span :class="getPriorityColorClass(traslado.prioridad)" class="inline-block rounded w-10 h-3 ml-2"></span>
              </p>
              

              <!-- <p v-if="traslado.estado === 'aceptado' && traslado.hora_aceptado"> -->
              <!-- </p> -->

              <div v-if="traslado.estado === 'aceptado'" class="pt-2 space-y-1">
                <p>
                  <span class="font-semibold text-gray-700">Hora de Aceptación:</span> {{ traslado.hora_aceptado}}</p>
                  <span class="font-semibold text-gray-700">Condiciones:</span>
                  {{ getCondicionesTexto(traslado.condiciones) }}
                <p><span class="font-semibold text-gray-700">Aislamiento:</span> {{ traslado.aislamiento }}</p>
                <p><span class="font-semibold text-gray-700">Motivo:</span> {{ traslado.motivo }}</p>
              </div>
            </div>

            <div class="mt-4 flex gap-3">
              <button v-if="traslado.estado === 'pendiente'"
                      @click="aceptarTraslado(traslado)"
                      class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md shadow transition">
                Aceptar
              </button>

              <button v-if="traslado.estado === 'aceptado'"
                      @click="finalizarTraslado(traslado)"
                      class="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md shadow transition">
                Finalizar
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center text-gray-500 mt-4">
          <p>No hay traslados pendientes.</p>
        </div>

        <div class="mt-8 text-center">
          <button @click="cerrarSesion"
                  class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-4 py-2 rounded-md transition">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      traslados: [],
      socket: null,
      celadorId: this.$route.params.id,
      notificacion: null
    };
  },
  mounted() {
    this.conectarWebSocket();
  },
  methods: {
    conectarWebSocket() {
      this.socket = new WebSocket("ws://localhost:3000");

      this.socket.onopen = () => {
        console.log("Conectado al servidor WebSocket");
        this.socket.send(JSON.stringify({ type: 'register', id: this.celadorId }));
        this.socket.send(JSON.stringify({ type: 'solicitar_traslados', celadorId: this.celadorId }));
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'nuevo_traslado') {
          this.actualizarTrasladoEnLista(data.traslado);
          if (data.traslado.estado === 'pendiente') {
            this.notificacion = `Nuevo traslado: ${data.traslado.ubicacion} → ${data.traslado.destino}`;
            new Audio('/noti.mp3').play();
            setTimeout(() => this.notificacion = null, 4000);
          }
        } else if (data.type === 'traslados_asignados') {
          this.traslados = data.traslados.map(t => ({
            ...t,
            aceptado: t.estado === 'aceptado'
          }));
        } else if (data.type === 'traslado_aceptado_actualizado') {
          const trasladoActualizado = this.traslados.find(t => t.id === data.trasladoId);
          if (trasladoActualizado) {
            trasladoActualizado.hora_aceptado = data.hora_aceptado;
          }
        } else if (data.type === 'actualizar_traslados') {
          this.solicitarTrasladosActualizados();
        } else if (data.type === 'traslado_actualizado') {
          this.actualizarTrasladoEnLista(data.traslado);
        
        }
      };

      this.socket.onclose = () => {
        console.log("WebSocket cerrado, reconectando...");
        setTimeout(this.conectarWebSocket, 2000);
      };

      this.socket.onerror = (error) => {
        console.error("Error en WebSocket:", error);
        this.socket.close();
      };
    },

    solicitarTrasladosActualizados() {
      fetch(`/traslados/pendientes`)
        .then(response => response.json())
        .then(data => {
          this.traslados = data.map(t => ({ ...t, aceptado: t.estado === 'aceptado' }));
        })
        .catch(error => console.error("Error al actualizar traslados:", error));
    },

    actualizarTrasladoEnLista(trasladoActualizado) {
      const index = this.traslados.findIndex(t => t.id === trasladoActualizado.id);
      if (index !== -1) {
        this.traslados.splice(index, 1, { ...this.traslados[index], ...trasladoActualizado, aceptado: trasladoActualizado.estado === 'aceptado' });
      } else {
        this.traslados.push({ ...trasladoActualizado, aceptado: trasladoActualizado.estado === 'aceptado' });
      }
    },

    aceptarTraslado(traslado) {
      this.socket.send(JSON.stringify({
        type: 'traslado_aceptado',
        trasladoId: traslado.id,
        celadorId: this.celadorId
      }));
      this.actualizarEstadoTraslado(traslado.id, 'aceptado');
      // No necesitamos actualizar hora_aceptado localmente aquí, lo haremos al recibir la actualización del backend
      alert(`Traslado aceptado: ${traslado.destino}`);
    },

    finalizarTraslado(traslado) {
      this.socket.send(JSON.stringify({
        type: 'traslado_finalizado',
        trasladoId: traslado.id,
        celadorId: this.celadorId
      }));
      this.traslados = this.traslados.filter(t => t.id !== traslado.id);
      alert(`Traslado finalizado: ${traslado.destino}`);
    },

    actualizarEstadoTraslado(id, nuevoEstado) {
      const traslado = this.traslados.find(t => t.id === id);
      if (traslado) {
        traslado.estado = nuevoEstado;
        traslado.aceptado = nuevoEstado === 'aceptado';
      }
    },

    cerrarSesion() {
      this.$router.push('/');
    },

    getCondicionesTexto(condiciones) {
      if (Array.isArray(condiciones)) {
        return condiciones.length > 0 ? condiciones.join(', ') : 'Ninguna';
      }
      try {
        const parsed = JSON.parse(condiciones);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed.join(', ') : 'Ninguna';
      } catch (e) {
        return 'Ninguna';
      }
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
@keyframes fade {
  0% { opacity: 0; transform: translateY(-10px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-10px); }
}

.animate-fade {
  animation: fade 4s ease-in-out forwards;
}
</style>