<template>
  <div id="Inicio">
  </div >
</template >

<script>
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
Vue.use(Vuetify)
import axios from 'axios'

export default {
  data() {
    return {
      api: {}
    }
  },
  methods: {
    restwrapPlan(api) {
      axios.get(`https://restwrap-dbrincau.herokuapp.com/api/v1/service/${api}`)
        .then(response => {
          this.api = response.data.data.content;
          console.log(response.data.data.content);
        })
        .catch(error => {
          console.log(error)
        });
    },
  },
  mounted() {
    this.restwrapPlan('isa-group/datasets/contents/plans/accuweather-sla4oai.yaml');
  }
};
</script>

<style>
* {
  box-sizing: border-box;
}

.column1 {
  float: left;
  width: 20%;
  padding: 10px;
}
.column2 {
  float: left;
  width: 70%;
  padding: 10px;
}

.row:after {
  content: "";
  display: table;
  clear: both;
}
img {
  width: 100%;
}
</style>