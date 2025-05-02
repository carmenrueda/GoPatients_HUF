import VueRouter from 'vue-router';
import Login from 'src/Login.vue';
import Medico from 'src/FormularioTraslado.vue';
import Celadores from 'src/Celadores.vue';
import Jefe from 'src/Jefe.vue';

const routes = [
  { path: '/', component: Login },
  { path: '/medico', component: Medico },
  { path: '/celador/:id', component: Celadores },
  { path: '/jefe', component: Jefe },
];

const router = new VueRouter({
  mode: 'history',
  routes
});

export default router;
