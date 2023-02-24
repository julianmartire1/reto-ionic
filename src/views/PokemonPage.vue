<template>
  <ion-page class="pokemon">
    <ion-content :fullscreen="true" v-if="getPokemon">
      <div class="pokemon__header">
        <div class="pokemon__header-back" @click="ionRouter.back()"><img src="/assets/icon/back.svg"></div>
        <div class="pokemon__header-title">{{ getPokemon.name }} <span>#{{ getPokemon.id }}</span></div>
        <img class="pokemon__header-img" :src="getPokemon.sprites.other.home.front_default" />
      </div>

      <div class="pokemon__container">
        <ion-segment class="pokemon__segment" value="about" v-model="segment" @ion-change="segmentChanged">
          <ion-segment-button class="pokemon__segment-button" value="about">
            <ion-label>About</ion-label>
          </ion-segment-button>
          <ion-segment-button class="pokemon__segment-button" value="moves">
            <ion-label>Moves</ion-label>
          </ion-segment-button>
        </ion-segment>
        <div class="pokemon__about" v-if="switchComponent === 0">
          <div class="pokemon__details">
            <div class="pokemon__detail">
              <span class="pokemon__detail-type">Species:</span>
              <span class="pokemon__detail-value">{{ getPokemon.species.name }}</span>
            </div>
            <div class="pokemon__detail">
              <span class="pokemon__detail-type">Height:</span>
              <span class="pokemon__detail-value">{{ getPokemon.height }}'</span>
            </div>
            <div class="pokemon__detail">
              <span class="pokemon__detail-type">Weight:</span>
              <span class="pokemon__detail-value">{{ getPokemon.weight }}kg</span>
            </div>
            <div class="pokemon__detail">
              <span class="pokemon__detail-type">Abilities:</span>
              <span class="pokemon__detail-value">{{ getPokemon.abilities.length }}</span>
            </div>
            <div class="pokemon__detail">
              <span class="pokemon__detail-type">Experience:</span>
              <span class="pokemon__detail-value">{{ getPokemon.base_experience }}</span>
            </div>
            <div class="pokemon__detail">
              <span class="pokemon__detail-type">Type:</span>
              <span class="pokemon__detail-value">
                <div class="pokemon__detail-value-type" v-for="pokemonType in getPokemon.types"
                  :key="pokemonType.type.name">
                  {{ pokemonType.type.name }}
                </div>
              </span>
            </div>
          </div>

          <div class="pokemon__stats-title">Base stats</div>

          <Bar id="my-chart-id" :options="chartOptions" :data="chartData" />
        </div>
        <div v-if="switchComponent === 1">
          <div class="pokemon_move-title">{{ getPokemon.moves.length }} moves</div>
          <div class="pokemon__moves">
            <div class="pokemon__move" v-for="{ move } in getPokemon.moves" :key="move.name">
              {{ capitalize(move.name).replaceAll('-', ' ') }}</div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  useIonRouter,
} from '@ionic/vue';
import { capitalize, ref } from 'vue';
import { usePokemon } from '@/store/usePokemon';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const ionRouter = useIonRouter();
const storePokemon = usePokemon();
const { getPokemon } = storePokemon;
const segment = ref<string>();
let switchComponent = 0;

let chartData: any = {
  labels: [],
  datasets: []
}
const chartOptions: any = {
  responsive: true,
  indexAxis: 'y',
  legend: {
    display: false
  },
}

const labels: any[] = [];
const datasets: any[] = [];

getPokemon.stats.forEach(({ base_stat, stat }: any) => {
  labels.push(capitalize(stat.name));
  datasets.push(base_stat);
});

chartData = {
  labels,
  datasets: [{ data: datasets, backgroundColor: '#072AC8', label: 'Level', }]
}

const segmentChanged = (event: any) => {
  const slide = event.target.value;
  switchComponent = slide !== 'about' ? 1 : 0;
}

</script>

<style scoped>
.pokemon__header {
  background: #ECECF2;
  padding: 68px 0 26px 0;
  position: relative;
}

.pokemon__header-back {
  position: absolute;
  top: 28px;
  left: 28px;
}

.pokemon__header-title {
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Readex Pro';
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  color: #3B3B3B;
  text-transform: capitalize;
  gap: 10px;
}

.pokemon__header-title span {
  font-weight: 500;
  font-size: 16px;
}

.pokemon__header-img {
  display: flex;
  margin: 0 auto;
  width: 150px;
  height: 150px;
  object-fit: contain;
  margin-top: -15px;
}

.pokemon__container {
  padding: 15px;
}

.pokemon__segment {
  width: fit-content;
}

.pokemon__segment-button {
  font-family: 'Readex Pro';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  text-transform: capitalize;
  --color: #8D91A5;
  --color-checked: #4361EE;
}

.pokemon__about {
  width: 100%;
}

.pokemon__details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  margin-top: 40px;
}

.pokemon__detail {
  display: flex;
  gap: 12px;
  margin-left: 21px;
}

.pokemon__detail-type {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;
  color: #8D91A5;
  width: 30%;
  text-align: left;
}

.pokemon__detail-value {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 22px;
  color: #3B3B3B;
  gap: 12px;
  display: flex;
}

.pokemon__detail-value-type {
  padding: 4px 8px;
  background: #16C172;
  border-radius: 2px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
  color: #FDFDFD;
  text-transform: capitalize;
}

.pokemon__stats-title {
  font-family: 'Readex Pro';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #55596D;
  text-align: left;
  margin: 42px 0 10px 0;
}

.pokemon_move-title {
  font-family: 'Readex Pro';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #55596D;
  margin-top: 36px;
  text-align: left;
}

.pokemon__moves {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-top: 36px;
  margin-bottom: 54px;
}

.pokemon__move {
  height: 100px;
  background: #16C172;
  border-radius: 4px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: #FDFDFD;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
