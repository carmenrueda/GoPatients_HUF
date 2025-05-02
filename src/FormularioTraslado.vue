<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-slate-100 to-blue-50 px-4 py-8">

    <!-- 🔘 Botón de cerrar sesión -->
    <div class="flex justify-end mb-4 max-w-xl mx-auto">
      <button @click="cerrarSesion"
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-4 py-2 rounded-md transition">
        Cerrar sesión
      </button>
    </div>

    <!-- 📋 Formulario -->
    <div class="bg-white p-6 rounded-2xl shadow-lg w-full max-w-xl mx-auto border border-gray-200">
      <h3 class="text-2xl font-bold text-blue-800 mb-6 text-center">Formulario de Traslado</h3>
      <form @submit.prevent="enviar" class="space-y-4">

        <!-- Ubicación -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación actual</label>
          <select v-model="form.ubicacion" required
                  class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500">
            <option disabled value="">Selecciona la ubicación actual</option>
            <option v-for="opcion in ubicaciones" :key="opcion" :value="opcion">{{ opcion }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Habitación actual</label>
          <input v-model="form.habitacion_actual" type="text" required
                class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500" />
        </div>

        <!-- Destino -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Destino</label>
          <select v-model="form.destino" required
                  class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500">
            <option disabled value="">Selecciona el destino</option>
            <option v-for="opcion in ubicaciones" :key="opcion" :value="opcion">{{ opcion }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Habitación de destino</label>
          <input v-model="form.habitacion_destino" type="text" required
                class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500" />
        </div>

        <!-- Condiciones (multiselección) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Condiciones del traslado</label>
          <div class="flex flex-wrap gap-2">
            <label v-for="opcion in condicionesDisponibles" :key="opcion"
                   class="flex items-center space-x-2 bg-slate-100 rounded px-3 py-1">
              <input type="checkbox" :value="opcion" v-model="form.condiciones" class="accent-blue-600">
              <span class="text-gray-700 text-sm">{{ opcion }}</span>
            </label>
          </div>
        </div>

        <!-- Aislamiento -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Aislamiento</label>
          <div class="flex gap-3">
            <label class="flex items-center gap-2 px-3 py-2 rounded-md border-2 cursor-pointer w-24 justify-center text-sm"
                   :class="form.aislamiento === 'Sí' ? 'bg-blue-100 border-blue-600 text-blue-800 font-semibold' : 'border-gray-300'">
              <input type="radio" value="Sí" v-model="form.aislamiento" class="sr-only" />
              Sí
            </label>

            <label class="flex items-center gap-2 px-3 py-2 rounded-md border-2 cursor-pointer w-24 justify-center text-sm"
                   :class="form.aislamiento === 'No' ? 'bg-blue-100 border-blue-600 text-blue-800 font-semibold' : 'border-gray-300'">
              <input type="radio" value="No" v-model="form.aislamiento" class="sr-only" />
              No
            </label>
          </div>
        </div>

        <!-- Motivo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Motivo del traslado</label>
          <select v-model="form.motivo" required
                  class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500">
            <option disabled value="">Selecciona el motivo</option>
            <option v-for="motivo in motivos" :key="motivo" :value="motivo">{{ motivo }}</option>
          </select>
        </div>

        <!-- Prioridad -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
          <div class="flex gap-3">
            <label class="flex items-center gap-2 justify-center w-28 px-3 py-2 rounded-md cursor-pointer border-2 transition text-sm text-gray-800"
                   :class="form.prioridad === 'Alta' ? 'ring ring-red-700 border-red-600' : 'border-red-400 bg-red-100/60'">
              <input type="radio" value="Alta" v-model="form.prioridad" class="accent-red-600" />
              <span>Alta</span>
            </label>

            <label class="flex items-center gap-2 justify-center w-28 px-3 py-2 rounded-md cursor-pointer border-2 transition text-sm text-gray-800"
                   :class="form.prioridad === 'Media' ? 'ring ring-yellow-600 border-yellow-500' : 'border-yellow-400 bg-yellow-100/60'">
              <input type="radio" value="Media" v-model="form.prioridad" class="accent-yellow-500" />
              <span>Media</span>
            </label>

            <label class="flex items-center gap-2 justify-center w-28 px-3 py-2 rounded-md cursor-pointer border-2 transition text-sm text-gray-800"
                   :class="form.prioridad === 'Baja' ? 'ring ring-green-700 border-green-600' : 'border-green-400 bg-green-100/60'">
              <input type="radio" value="Baja" v-model="form.prioridad" class="accent-green-600" />
              <span>Baja</span>
            </label>
          </div>
        </div>

        <!-- Botón de enviar -->
        <button type="submit"
                class="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-md transition-colors">
          Enviar
        </button>

      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        ubicacion: "",
        destino: "",
        condiciones: [],
        aislamiento: "No",
        motivo: "",
        prioridad: "Media",
        habitacion_actual: "",
        habitacion_destino: ""
      },
      socket: null,
      ubicaciones: [
        "PLANTA BAJA", "PLANTA 2ª", "CARDIO", "ALERGIA", "REUMA+ONCO",
        "GINE-HISTERIOS+CARTAS", "DIGESTIVO (120)", "DIGESTIVO (121)",
        "3ª sala DIGESTIVO", "HDQ", "HALL", "UROLOGÍA",
        "NEUMOLOGÍA", "OFTALMOLOGÍA", "REFUERZO", "EXTRACCIONES"
      ],
      condicionesDisponibles: ["Cama", "Silla", "O2", "Pie de suero"],
      motivos: [
        "Movilización paciente", "Traslado paciente", "Encamado paciente",
        "Muestras", "Documentos", "Material"
      ]
    };
  },
  mounted() {
    this.socket = new WebSocket("ws://localhost:3000");
  },
  methods: {
    enviar() {
      const mensaje = {
        type: 'traslado',
        ubicacion: this.form.ubicacion,
        destino: this.form.destino,
        condiciones: this.form.condiciones,
        aislamiento: this.form.aislamiento,
        motivo: this.form.motivo,
        prioridad: this.form.prioridad,
        habitacion_actual: this.form.habitacion_actual,
        habitacion_destino: this.form.habitacion_destino
      };
      console.log("Enviando mensaje:", mensaje);
      this.socket.send(JSON.stringify(mensaje));
      alert("Formulario enviado");
    },
    cerrarSesion() {
      if (this.socket) this.socket.close();
      this.$router.push("/");
    }
  }
};
</script>
