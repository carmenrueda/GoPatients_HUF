<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-100 to-blue-50">
    <div class="login bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm border border-gray-200">
      <h2 class="text-2xl font-bold text-center text-blue-800 mb-6">Inicio de sesión</h2>
      <form @submit.prevent="login" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
          <input
            type="text"
            v-model="username"
            placeholder="Usuario"
            required
            class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            type="password"
            v-model="password"
            placeholder="Contraseña"
            required
            class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-md transition-colors"
        >
          Iniciar sesión
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    async login() {
      try {
        const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        });

        const data = await response.json();

        if (data.success) {
          if (data.tipo_usuario === 'medico') {
            this.$router.push('/medico');
          } else if (data.tipo_usuario === 'celador') {
            this.$router.push(`/celador/${this.username}`);
          } else if (data.tipo_usuario === 'jefe') {
            this.$router.push('/jefe');
          }
        } else {
          alert('Credenciales incorrectas');
        }
      } catch (error) {
        console.error('Error de conexión', error);
        alert('No se pudo conectar con el servidor');
      }
    },
  },
};
</script>

<style scoped>
/* Eliminamos los estilos antiguos para dejar que Tailwind actúe */
</style>
