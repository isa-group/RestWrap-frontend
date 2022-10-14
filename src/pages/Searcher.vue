<template>
  <div id="Seacher">
    Username / Organization: 
    <input type="text" v-model="username" class="searchUser">
    <button class="button-62" role="button" @click="restwrapRepositories()">
      Search
    </button>
    &ensp;
    Repository:
    <select name="repositories" id="repositories" v-if="repositories.length != 0">
      <option value="0">Choose a repository</option>
      <option v-for="repository in repositories" :key="repository.id" :value="repository" @click="restwrapRepositoryData(username, repository.name)">{{repository.name}}</option>
    </select>
    <ul class="fileList">
      <li v-for="file in repositoryData" :key="file.id">
        <a class="fileObject" @click="restwrapFolder(file.url)" v-if="file.name && (file.type == 'dir' || file.type == 'tree')">{{file.name}}</a>
        <a class="fileObject" @click="restwrapPlan(file.url)" v-if="file.name && (file.type != 'dir' && file.type != 'tree')">{{file.name}}</a>
      </li>
    </ul>
    <br>      
    <p class="pStatsApi" v-if="!apiStatsLoaded && Object.keys(api).length != 0">This file is not a SLA4OAI file or It is not well created</p>
    <p class="pStatsApi" v-if="apiStatsLoaded && Object.keys(api).length != 0">
      <pre class="preStats">
      Stats:
      
      N. Metrics: {{apiStats.numberOfMetrics}}
      Metrics: {{apiStats.metricsNames.join(", ")}}
      N. Plans: {{apiStats.numberOfPlans}}
      Cheapest plan: {{apiStats.cheapestPlan}}
      Most expensive plan: {{apiStats.mostExpensivePlan}}

      Plans:
      </pre>
      <table id="apiStats">
        <tr>
          <th></th>
          <th v-for="plan in Object.keys(apiStats.plans)" :key="plan" :value="plan">{{plan}}</th>
        </tr>
        <tr>
          <th>Cost</th>
          <td v-for="plan in apiStats.plans" :key="plan" :value="plan">{{plan.pricing.cost}} {{plan.pricing.currency}}/{{plan.pricing.period.unit}}</td>
        </tr>
        <tr>
          <th>N. Endpoints</th>
          <td v-for="plan in apiStats.plans" :key="plan" :value="plan">{{Object.keys(plan.quotas).length}}</td>
        </tr>
      </table>
    </p>
    <br>
    <pre v-if="Object.keys(api).length != 0" class="api-content">
      {{api.content}}
    </pre>
    <br><br><br><br>
  </div>
</template>

<script>
  import Vue from 'vue'
  import Vuetify from 'vuetify'
  import 'vuetify/dist/vuetify.min.css'
  Vue.use(Vuetify)
  import axios from 'axios'
  
  export default {
    data() {
      return {
        username: "",
        api: {},
        repositories: [],
        repositoryData: {},
        route: "https://api.github.com/repos/",
        apiStats: {},
        apiStatsLoaded: false,
      }
    },
    methods: {
      getUrl() {
        this.api = {};
        this.apiStats = {};
        this.apiStatsLoaded = false;
        var url = window.location.href.split("/");
        if (url.length > 3) {
          this.username = url[3];
          this.restwrapRepositories();
        }

        if (url.length > 4) {
          let repo = url[4];
          if (this.repositories.length == 0) {
            console.log("Waiting for repositories");
            setTimeout(() => {
              this.repositories.map((repository) => {
                if (repository.name == repo) {
                  this.restwrapRepositoryData(this.username, repo);
                }
              });
            }, 3000);
          }

          this.repositories.map((repository) => {
            if (repository.name == repo) {
              this.restwrapRepositoryData(this.username, repo);
            }
          });
        }
        /*
        if (url.length > 5) {
          setTimeout(() => {
            let sublist = url.slice(5, url.length).join("/");
            this.restwrapFolder(`https://api.github.com/repos/${this.username}/${url[4]}/contents/${sublist}`);
          }, 4000);
        }
        */
      },
      getApiStats(apiUrl) {
        axios.get(`${process.env.VUE_APP_BACK_URL}stats/${apiUrl}`)
          .then(response => {
            this.apiStatsLoaded = false;
            if (response.data.message == "200 Ok") this.apiStatsLoaded = true;
            this.apiStats = response.data.data;
          })
          .catch(error => {
            console.log(error);
          });
      },
      restwrapFolder(url) {
        axios.post(`${process.env.VUE_APP_BACK_URL}content`, {"url": url})
          .then(response => {
            this.repositoryData = response.data.data;
            this.api = {};
            this.apiStats = {};
            this.apiStatsLoaded = false;
          })
          .catch(error => {
            console.log(error)
          })
      },
      restwrapPlan(api) {
        api = api.replace("https://api.github.com/repos/", "");
        api = api.replace("?ref=main", "");
        this.getApiStats(api);
        axios.get(`${process.env.VUE_APP_BACK_URL}service/${api}`)
          .then(response => {
            this.api = response.data.data;
          })
          .catch(error => {
            console.log(error);
          });
      },
      restwrapRepositories() {
        if (this.username != "") {
          axios.get(`${process.env.VUE_APP_BACK_URL}repositories/${this.username}`)
          .then(response => {
            this.repositories = response.data.data;
            this.api = {};
            this.apiStats = {};
            this.apiStatsLoaded = false;
          })
          .catch(error => {
            console.log(error);
          });
        }
      },
      restwrapRepositoryData(username, repository) {
        axios.get(`${process.env.VUE_APP_BACK_URL}data/${username}/${repository}`)
          .then(response => {
            this.repositoryData = response.data.data;
            this.api = {};
            this.apiStats = {};
            this.apiStatsLoaded = false;
          })
          .catch(error => {
            console.log(error);
          });
      },
    },
    mounted() {
      this.getUrl();
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

.button-62 {
  background: linear-gradient(to bottom right, #EF4765, #FF9A5A);
  border: 0;
  border-radius: 12px;
  color: #FFFFFF;
  cursor: pointer;
  display: inline-block;
  font-family: -apple-system,system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 2.5;
  outline: transparent;
  padding: 0 1rem;
  text-align: center;
  text-decoration: none;
  transition: box-shadow .2s ease-in-out;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  white-space: nowrap;
}

.button-62:not([disabled]):focus {
  box-shadow: 0 0 .25rem rgba(0, 0, 0, 0.5), -.125rem -.125rem 1rem rgba(239, 71, 101, 0.5), .125rem .125rem 1rem rgba(255, 154, 90, 0.5);
}

.button-62:not([disabled]):hover {
  box-shadow: 0 0 .25rem rgba(0, 0, 0, 0.5), -.125rem -.125rem 1rem rgba(239, 71, 101, 0.5), .125rem .125rem 1rem rgba(255, 154, 90, 0.5);
}

.searchUser {
  font-size: 14px;
  border-radius: 6px;
  line-height: 1.5;
  padding: 5px 10px;
  transition: box-shadow 100ms ease-in, border 100ms ease-in, background-color 100ms ease-in;
  border: 2px solid #dee1e2;
  color: rgb(14, 14, 16);
  background: #dee1e2;
  height: 36px;                
}
.searchUser:hover {
  border-color: #ccc;
}
.searchUser:focus{
  border-color: #9147ff;
  background: #fff;
}

.fileList {
  width: 50%;
  margin: auto;
  margin-top: 10px;
  text-align: left;
  background-color: #f1f1f1;
}
.fileList li {
  list-style-type: none;
}

.api-content {
  width: 50%;
  margin: auto;
  margin-top: 10px;
  text-align: left;
}

pre {
  max-height: 500px;
  overflow: auto;
  background-color: #e2e2e2;
  border: 1px solid #898989;
  padding: 5px;
}

.fileObject {
  cursor: pointer;
}

.pStatsApi{
  width: 50%;
  margin: auto;
}
.preStats {
  text-align: left;
  padding: 5px;
  margin-top: 10px;
  background-color: #ffffff;
  border: #ffffff;
}

table {
  margin: auto;
}
td, th {
  border: 1px solid #898989;
  text-align: left;
  padding: 8px;
}
</style>