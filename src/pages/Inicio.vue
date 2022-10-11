<template>
  <div id="inicio">
    <Searcher class="searcher"/>
  </div>
</template>
  
<script>
import Searcher from "./Searcher";

export default {
  name: "Inicio",
  components: {
    Searcher
  },
  data() {
    return {
      
    }
  },
  methods: {
    
  },
  mounted() {

  }
}
</script>

<style>
.searcher {
  margin-top: 5%;
  text-align: center;
}
</style>