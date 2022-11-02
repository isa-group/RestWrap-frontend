<template>
  <div id="Seacher">
    <div>
      Username / Organization:
      <input type="text" v-model="username" class="searchUser" style="margin-right: 20px;">
      <button class="button-62" role="button" @click="restwrapRepositories()" v-if="username != '' && repositoryName == ''">
        Search
      </button>
      &ensp;
      Repository:
      <select name="repositories" id="repositories" v-if="repositories.length != 0" v-model="repositoryName" class="searchUser" style="margin-right: 20px;">
        <option value="0">Choose a repository</option>
        <option v-for="repository in repositories" :key="repository.id" :value="repository.name">{{repository.name}}</option>
      </select>
      <button class="button-62" role="button" @click="restwrapRepositoryData(username, repositoryName)" v-if="username != '' && repositoryName != '' && Object.keys(repositoryData).length == 0">
        Search
      </button>
      <button class="button-62" role="button"  style="background: linear-gradient(to bottom right, #47e9ef, #785aff);" @click="reloadWebsite()" v-if="Object.keys(repositoryData).length != 0">
        Reset Search
      </button>
    </div>

    <div v-if="loading">
      <br><br><br><br><br><br><br><br><br>
      <p>LOADING...</p>
    </div>
    
    <div v-if="loading == false">
      <ul class="fileList" v-if="!apiStatsLoaded">
        <li v-for="file in repositoryData" :key="file.id">
          <a class="fileObject" @click="restwrapFolder(file.url, file.name)" v-if="file.name && (file.type == 'dir' || file.type == 'tree')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-folder" viewBox="0 0 16 16"> <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4H2.19zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707z"/> </svg>{{file.name}}</a>
          <a class="fileObject" @click="restwrapPlan(file.url)" v-if="file.name && (file.type != 'dir' && file.type != 'tree') && (file.name.includes('.yaml') || file.name.includes('.yml'))">{{file.name.replace(".yaml", "").replace(".yml", "")}}</a>
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
        <table id="apiStats" v-if="apiStats.plans[Object.keys(apiStats.plans)[0]].pricing.currency">
          <tr>
            <th></th>
            <th v-for="plan in Object.keys(apiStats.plans)" :key="plan" :value="plan">{{plan}}</th>
          </tr>
          <tr>
            <th>Cost</th>
            <td v-for="plan in apiStats.plans" :key="plan" :value="plan">
              <p v-if="plan.pricing.currency">
                {{plan.pricing.cost}} {{plan.pricing.currency}}/{{plan.pricing.period.unit}}
              </p>
            </td>
          </tr>
          <tr>
            <th>N. Endpoints</th>
            <td v-for="plan in apiStats.plans" :key="plan" :value="plan">{{Object.keys(plan.quotas).length}}</td>
          </tr>
        </table>
        <table v-else>
          <tr>
            <th></th>
            <th v-for="plan in Object.keys(apiStats.plans)" :key="plan" :value="plan">{{plan}}</th>
          </tr>
          <tr>
            <th>Cost</th>
            <td v-for="plan in apiStats.plans" :key="plan" :value="plan">
              <p v-if="plan.pricing">
                {{plan.pricing.cost}}
              </p>
            </td>
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
      <br>
      <button class="button-62" role="button" style="background: linear-gradient(to bottom right, #048c1f, #6cbf19);" @click="validateAPI()" v-if="apiStatsLoaded && Object.keys(api).length != 0">Analyze validity</button>
      
      <br>
      <div v-if="folderStatsLoaded" class="preContainer">
        <pre class="preStats">
        Number of APIs: {{folderStats.plansQuantity}}
        Number of APIs with limitations: {{folderStats.hasLimitations}}
        Number of APIs with quotas: {{folderStats.hasQuotas}}
        Number of APIs with rates: {{folderStats.hasRates}}
        Number of APIs with both (quotas and rates): {{folderStats.hasQuotasAndRates}}
        Number of APIs with a simple cost: {{folderStats.hasSimpleCost}}
        Number of APIs with a pay-as-you-go plan: {{folderStats.hasPayAsYouGo}}
        Number of APIs with a overage: {{folderStats.hasOvegare}}
        </pre>
      </div>
      <br><br>
    </div>
    
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
        repositoryName: "",
        api: {},
        repositories: [],
        repositoryData: {},
        route: "https://api.github.com/repos/",
        apiStats: {},
        apiStatsLoaded: false,
        actualRepository: "",
        actualFolder: "",
        folderStats: {},
        folderStatsLoaded: false,
        loading: false,
        pricingURL: "",
      }
    },
    methods: {
      getUrl() {
        this.api = {};
        this.apiStats = {};
        this.apiStatsLoaded = false;
        var url = window.location.href.split("/");
        url = url.filter(x => x != "");
        if (url.length < 3) {
          this.defaultSearch();
        } else {
          if (url.length >= 3) {
            this.username = url[2];
            this.restwrapRepositories();
          }

          if (url.length >= 4) {
            let repo = url[3];
            if (this.repositories.length == 0) {
              console.log("Waiting for repositories");
              setTimeout(() => {
                this.repositories.map((repository) => {
                  if (repository.name == repo) {
                    this.repositoryName = repository.name;
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
        }
      },
      validateAPI() {
        const config = {
          method: 'post',
          url: "https://sla4oai-analyzer-api.herokuapp.com/api/v1/analysisRequests",
          data: {
            "analysisId": "analysisId",
            "pricingURL": "https://raw.githubusercontent.com/isa-group/datasets/master/plans/accuweather-sla4oai.yaml",
            "operation": "validity"
          },
          headers: {
            "Content-Type": "application/JSON",
              "Access-Control-Allow-Origin": "*"
          }
        };
        axios(config)
        .then((response) => {
          console.log(response);
        }).catch((error) => {
          console.log(error);
        });
      },
      defaultSearch() {
        this.username = "isa-group";
        this.repositoryName = "datasets";
        this.repositories = [{
          name: "datasets"
        }];
        this.restwrapRepositoryData(this.username, this.repositoryName);
      },
      reloadWebsite() {
        this.username = "";
        this.repositoryName = "";
        this.api = {};
        this.repositories = [];
        this.repositoryData = {};
        this.route = "https://api.github.com/repos/";
        this.apiStats = {};
        this.apiStatsLoaded = false;
        this.actualRepository = "";
        this.actualFolder = "";
        this.folderStats = {};
        this.folderStatsLoaded = false;
        this.loading = false;
        this.pricingURL = "";
        //this.$router.go();
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
      restwrapFolder(url, fileName) {
        this.actualFolder += fileName + "/";
        this.restWrapStats(this.actualFolder);
        axios.post(`${process.env.VUE_APP_BACK_URL}content`, {"url": url})
          .then(response => {
            this.repositoryData = response.data.data;
            this.api = {};
            this.apiStats = {};
            this.apiStatsLoaded = false;
          })
          .catch(error => {
            console.log(error)
          });
      },
      restWrapStats() {
        this.loading = true;
        this.folderStatsLoaded = false;
        axios.post(`${process.env.VUE_APP_BACK_URL}repositoryStats/`, {
            "user": this.username,
            "repo": this.actualRepository,
            "path": this.actualFolder 
          })
          .then(response => {
            this.loading = false;
            this.folderStatsLoaded = true;
            this.folderStats = response.data;
            //console.log(response.data);
          })
          .catch(error => {
            console.log(error)
          });
      },
      restwrapPlan(api) {
        api = api.replace("https://api.github.com/repos/", "");
        api = api.replace("?ref=main", "");
        this.getApiStats(api);
        axios.get(`${process.env.VUE_APP_BACK_URL}service/${api}`)
          .then(response => {
            this.api = response.data.data;
            this.pricingURL = this.api.download_url;
            console.log(this.pricingURL);
          })
          .catch(error => {
            console.log(error);
          });
      },
      restwrapRepositories() {
        this.folderStatsLoaded = false;
        this.actualRepository = ""
        this.actualFolder = ""
        this.folderStats = {}
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
        this.folderStatsLoaded = false;
        this.actualRepository = ""
        this.actualFolder = ""
        this.folderStats = {}
        this.actualRepository = repository;
        axios.get(`${process.env.VUE_APP_BACK_URL}data/${username}/${repository}`)
          .then(response => {
            this.restWrapStats();
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
  background-color: #ffffff;
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
  margin: auto;
}

table {
  margin: auto;
}
td, th {
  border: 1px solid #898989;
  text-align: left;
  padding: 8px;
}

.preContainer {
  display: flex;
  margin: auto;
}
</style>