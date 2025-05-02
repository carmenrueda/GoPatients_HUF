import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';
import Login from './Login.vue';
import Medico from './FormularioTraslado.vue';
import Celadores from './Celador.vue';
import Jefe from './Jefe.vue';
import './assets/tailwind.css'


Vue.config.productionTip = false;

// Usar Vue Router
Vue.use(VueRouter);

// Definir rutas
const routes = [
  { path: '/', component: Login },
  { path: '/medico', component: Medico },
  { path: '/celador/:id', component: Celadores },
  { path: '/jefe', component: Jefe}
];

// Crear el router
const router = new VueRouter({
  routes
});

// Instanciar Vue
new Vue({
  render: h => h(App),
  router
}).$mount('#app');
