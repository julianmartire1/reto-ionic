<template>
  <ion-page class="home">
    <ion-content class="home__content" :fullscreen="true" id="home-content" :scroll-events="true">
      <div class="home__header">
        <div class="home__header-content">
          <h1 class="home__title">What pokemon are you looking for?</h1>

          <div class="home__search">
            <div class="home__item-input-search">
              <input class="home__input-search" placeholder="Search pokemon" v-model="pokemonNameSearch" />
              <img class="home__input-search-icon" src="/assets/icon/search.svg">
            </div>
            <ion-button id="open-modal" class="home__filter">
              <img src="/assets/icon/filter.svg">
            </ion-button>
          </div>
        </div>
        <img class="home__img" src="/assets/pokeball.svg" />
      </div>

      <ion-modal ref="modal" trigger="open-modal">
        <ion-content>
          <div class="modal__filter">
            <img @click="close(true)" src="/assets/icon/close.svg" />

            <div class="modal__filter-title">Filtrer pokemon list</div>

            <div class="modal__filters">
              <div class="modal__filter-input" id="popover-movement"
                :class="{ 'modal__filter-input--selected': moveSelected }">
                <ion-label>Select movement number</ion-label>
                <ion-chip class="modal__filter-chip" v-if="moveSelected">{{ moveSelected }}</ion-chip>
                <img class="modal__filter-input-icon" src="/assets/icon/arrow-down.svg">
                <ion-popover class="modal__filter-input-popover" trigger="popover-movement" size="cover"
                  :dismissOnSelect="true">
                  <ion-content>
                    <ion-scroll>
                      <ion-list class="modal__filter-input-items">
                        <ion-item @click="setFilterMove(opMove)" v-for="opMove in movesFilterOptions" :key="opMove"
                          class="modal__filter-input-item" :button="true" :detail="false">{{ opMove }}</ion-item>
                      </ion-list>
                    </ion-scroll>
                  </ion-content>
                </ion-popover>
              </div>

              <div class="modal__filter-input" id="popover-type"
                :class="{ 'modal__filter-input--selected': typeSelected.length }">
                <ion-label>Pokemon type</ion-label>
                <div class="modal__filter-chips" v-if="typeSelected.length">
                  <ion-chip @click.stop="removeType(t)" v-for="t in typeSelected" :key="t.id"
                    class="modal__filter-chip">{{ t.name }} <ion-icon :icon="closeOutline"></ion-icon></ion-chip>
                </div>
                <img class="modal__filter-input-icon" src="/assets/icon/arrow-down.svg">
                <ion-popover class="modal__filter-input-popover" trigger="popover-type" size="cover"
                  :dismissOnSelect="true">
                  <ion-content>
                    <ion-scroll>
                      <ion-list class="modal__filter-input-items">
                        <ion-item @click="setFilterType(opType)" v-for="opType in filteredTypes" :key="opType.name"
                          class="modal__filter-input-item" :button="true" :detail="false">{{ opType.name }}</ion-item>
                      </ion-list>
                    </ion-scroll>
                  </ion-content>
                </ion-popover>
              </div>
            </div>

            <div class="modal__filter-buttons">
              <ion-button class="modal__filter-button" @click="clear()">Cancel</ion-button>
              <ion-button class="modal__filter-button modal__filter-buttons--active" @click="filter()">Filter</ion-button>
            </div>
          </div>
        </ion-content>
      </ion-modal>

      <ion-spinner v-if="loading" color="primary" class="spinner" name="crescent"></ion-spinner>

      <div class="home__results" v-if="movefilter || typefilter.length || pokemonNameSearch">{{filteredPokemon.length}} results</div>

      <div class="pokemons">
        <ion-card @click="goToPokemon(pokemon)" class="pokemon"
          v-for="(pokemon, index) in filteredPokemon.slice(startIndex(), endIndex())" :key="index">
          <img class="pokemon__img" :src="pokemon.sprites.other.home.front_default" />
          <ion-card-header>
            <ion-card-title class="pokemon__title">{{ pokemon.name }}</ion-card-title>
            <ion-card-subtitle class="pokemon__subtitle"># {{ pokemon.id }}</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <div class="pokemon__skills">
              <div class="pokemon__skill">Moves <span>{{ pokemon.moves.length }}</span></div>
              <div class="pokemon__skill">Experience <span>{{ pokemon.base_experience }}</span></div>
            </div>

            <div class="pokemon__chips">
              <ion-chip v-for="pokemonType in pokemon.types" class="pokemon__chip" :key="pokemonType.type.name">{{
                pokemonType.type.name }}</ion-chip>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
      <div class="pagination" :hidden="loading">
        <ion-button fill="clear" class="pagination__button" v-if="currentPage > 1" @click="onChangePage(currentPage - 1)">
          <img src="/assets/icon/arrow-left.svg" />
        </ion-button>

        <ion-button :fill="currentPage === page ? 'solid' : 'clear'" class="pagination__button"
          v-for="(page, index) in visiblePages" :key="index" @click="onChangePage(page)"
          :class="{ 'pagination__button--active': currentPage === page }">{{ page }}</ion-button>

        <ion-button fill="clear" class="pagination__button" v-if="currentPage < totalPages"
          @click="onChangePage(currentPage + 1)">
          <img src="/assets/icon/arrow-right.svg" />
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonSpinner,
  IonButton,
  IonModal,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  useIonRouter,
} from '@ionic/vue';
import { closeOutline } from 'ionicons/icons';
import axios from 'axios';
import { defineComponent } from 'vue';

import { usePokemon } from '@/store/usePokemon';
import { OverlayEventDetail } from '@ionic/core';

export default defineComponent({
  components: {
    IonContent,
    IonPage,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonChip,
    IonSpinner,
    IonButton,
    IonModal,
    IonPopover,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
  },
  setup() {
    return { closeOutline };
  },
  data(): any {
    return {
      ionRouter: useIonRouter(),
      storePokemon: usePokemon(),
      pokemons: [],
      filteredPokemon: [],
      loading: false,
      visiblePages: [],
      currentPage: 1,
      itemsPerPage: 10,
      totalPages: 1,
      maxButtons: 5,
      pageLimit: 6,
      pageSize: 10,
      pokemonNameSearch: '',
      movesFilterOptions: [],
      moveSelected: null,
      movefilter: null,
      pokemonsTypes: [],
      filteredTypes: [],
      typeSelected: [],
      typefilter: [],
    };
  },
  methods: {
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    endIndex() {
      return this.startIndex() + this.itemsPerPage;
    },
    goToPokemon(pokemon: any) {
      this.storePokemon.setPokemon(pokemon);
      this.ionRouter.push('/pokemon/' + pokemon.id);
    },
    scrollToTop() {
      const scrollTo: any = document.getElementById('home-content');
      scrollTo?.scrollToPoint(0, scrollTo.offsetTop, 500)
    },
    async getPokemonDetails() {
      this.loading = true;
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=50`);

      if (response.status === 200) {
        const pokemonList: any = response.data.results;
        const pokemonDetailPromises = pokemonList.map((pokemon: any) => axios.get(pokemon.url));
        const types = await axios.get('https://pokeapi.co/api/v2/type/')
        const pokemonDetailResponses = await Promise.all([...pokemonDetailPromises, types]);
        const resPokemons = pokemonDetailResponses.slice(0, -1);
        const resType = pokemonDetailResponses.slice(-1);

        this.pokemonsTypes = resType[0].data.results.map((type: any, index: number) => ({
          name: type.name,
          selected: false,
          id: index
        }));
        this.pokemons = resPokemons.map(response => response.data);

        this.loading = false;
      }
    },
    async fetchPokemonDetails() {
      this.totalPages = Math.ceil(this.filteredPokemon.length / this.pageSize);
      this.visiblePages = this.pages();
      this.scrollToTop();
    },
    startPage() {
      let start = Math.max(1, this.currentPage - Math.floor(this.maxButtons / 2));
      let end = start + this.maxButtons - 1;

      if (end > this.totalPages) {
        end = this.totalPages;
        start = end - this.maxButtons + 1;
        start = Math.max(1, start);
      }
      return start;
    },
    endPage() {
      let end = Math.min(this.totalPages, this.currentPage + Math.floor(this.maxButtons / 2));
      let start = end - this.maxButtons + 1;

      if (start < 1) {
        start = 1;
        end = start + this.maxButtons - 1;
        end = Math.min(this.totalPages, end);
      }
      return end;
    },
    pages() {
      const res = Array.from({ length: this.totalPages }, (_, i) => i + 1)
        .filter(i => i >= this.startPage() && i <= this.endPage())
        .slice(0, this.maxButtons);

      if (this.currentPage >= this.pageLimit) {
        const slicedPages = Array.from({ length: this.totalPages }, (_, i) => i + 1)
          .filter(i => i >= this.currentPage && i < this.currentPage + this.maxButtons);
        if (slicedPages.length > 0) {
          return slicedPages;
        }
      }

      return res;
    },
    onChangePage(page: number) {
      this.currentPage = page;
      this.fetchPokemonDetails();
    },
    confirm() {
      this.$refs.modal.$el.dismiss({}, 'confirm');
    },
    close(noApplyFilter = false) {
      if (noApplyFilter) {
        this.moveSelected = this.movefilter
        this.typeSelected = this.typefilter
      }
      this.$refs.modal.$el.dismiss({}, 'close');
    },
    getMovesFilter() {
      const maxMoves = Math.max(...this.filteredPokemon.map((p: any) => p.moves.length));
      const optionsCount = 5;

      const increment = Math.floor(maxMoves / optionsCount);
      let options = Array.from({ length: optionsCount }, (_, i) => (i + 1) * increment);
      options.push(maxMoves);
      options = options.filter((op) => op !== 0);
      options = options.filter((op, i) => options.indexOf(op) === i)

      this.movesFilterOptions = options;
    },
    getTypesFilter() {
      const typeSet = new Set();
      this.filteredPokemon.forEach((p: any) => {
        p.types.forEach((t: any) => {
          typeSet.add(t.type.name);
        });
      });
      const filteredTypes = Array.from(typeSet);
      this.filteredTypes = this.pokemonsTypes.filter((t: any) => filteredTypes.includes(t.name));
    },
    setFilterMove(opMove: any) {
      this.moveSelected = opMove
    },
    setFilterType(opType: any) {
      const index = this.typeSelected.findIndex((type: any) => type.name === opType.name);
      index > -1 ? this.typeSelected.splice(index, 1) : this.typeSelected.push(opType)
      opType.selected = !opType.selected
    },
    removeType(opType: any) {
      const index = this.typeSelected.findIndex((type: any) => type.name === opType.name);
      this.typeSelected.splice(index, 1)
    },
    filter() {
      this.movefilter = this.moveSelected;
      this.typefilter = this.typeSelected.slice();
      this.close();
    },
    clear() {
      this.movefilter = this.moveSelected = null;
      this.typefilter = this.typeSelected = [];
      this.close();
    }
  },
  async mounted() {
    await this.getPokemonDetails();
    this.fetchPokemonDetails();
  },
  created() {
    this.$watch((vm: any) => [vm.pokemons, vm.pokemonNameSearch, vm.movefilter, vm.typefilter], (val: any) => {
      this.filteredPokemon = this.pokemons.filter((p: any) => {
        return p.name.toLowerCase().includes(this.pokemonNameSearch.toLowerCase()) &&
          p.moves.length >= this.movefilter
      });
      if (this.typefilter.length > 0) {
        this.filteredPokemon = this.filteredPokemon.filter((p: any) => p.types.some((t: any) => this.typefilter.find((tf: any) => tf.name === t.type.name)));
      }

      this.getMovesFilter();
      this.getTypesFilter();
      this.onChangePage(1)
    }, { deep: true })
  },
});

</script>

<style scoped>
.home__content {
  --ion-background-color: #dcdde8;
}

.home__header {
  height: 234px;
  background: #072AC8;
  position: relative;
  display: flex;
}

.home__header-content {
  z-index: 2;
  margin-top: 70px;
  padding-left: 16px;
}

.home__title {
  margin: 0;
  color: #FCFCFC;
  font-family: 'Readex Pro';
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
  width: 80%;
}

.home__search {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 24px;
  gap: 16px;
}

.home__item-input-search {
  display: flex;
  position: relative;
  width: 100%;
}

.home__input-search {
  background-color: transparent;
  border: none;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #FCFCFC;
  border-bottom: 1px solid #FCFCFC;
  border-radius: 8px 8px 0px 0px;
  padding: 12px 20px 12px 16px;
  width: 100%;
}

.home__input-search::placeholder {
  color: #FCFCFC;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
}

.home__input-search:focus-visible {
  outline: none;
  background: #dcdde826;
}

.home__input-search-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 16px;
}

.home__filter {
  margin: 0;
  min-width: 40px;
  height: 40px;
  margin-right: 10px;
  --background: transparent;
  --box-shadow: none;
  --border-radius: 2px;
  --padding-end: 0;
  --padding-start: 0;
}

.home__results {
  background: #FCFCFC;
  border-radius: 8px;
  font-family: 'Readex Pro';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #55596D;
  padding: 12px 16px;
  margin: 24px 16px 0 16px;
}

.home__img {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 0;
  mix-blend-mode: overlay;
}

.pokemons {
  gap: 24px;
  display: flex;
  flex-direction: column;
  margin: 24px 0;
}

.pokemon {
  box-shadow: none;
  border-radius: 16px;
  background: #FDFDFD;
  border-width: 0px 1px 1px 1px;
  border-style: solid;
  border-color: #DCDDE8;
  margin: 0 16px;
}

.pokemon__img {
  width: 100%;
  height: 159px;
  object-fit: contain;
  background: #ECECF2;
}

.pokemon__title {
  font-family: 'Readex Pro';
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
  color: #3B3B3B;
  text-transform: capitalize;
}

.pokemon__subtitle {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #8D91A5;
  margin-top: 4px;
}

.pokemon__skills {
  display: flex;
  gap: 24px;
}

.pokemon__skill {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #8D91A5;
}

.pokemon__skill span {
  color: #55596D;
  margin-left: 8px;
}

.pokemon__chips {
  display: flex;
  gap: 8px;
}

.pokemon__chip {
  margin: 16px 0 0 0;
  background: #ECECF2;
  border-radius: 16px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #8D91A5;
  text-transform: capitalize;
}

.spinner {
  display: block;
  margin: 20px auto;
  height: 50px;
  width: 50px;
}

.pagination {
  height: 80px;
  background: #FDFDFD;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.pagination__button {
  margin: 0;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  color: #8D91A5;
  width: 40px;
  height: 40px;
}

.pagination__button--active {
  --border-radius: 4px;
  color: #FDFDFD;
}

.modal__filter {
  padding: 28px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.modal__filter-title {
  font-family: 'Readex Pro';
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
  color: #3B3B3B;
  margin: 20px 0 40px 0;
}

.modal__filters {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

.modal__filter-input {
  position: relative;
  width: 100%;
  background: #ECECF2;
  color: black;
  border-radius: 8px 8px 0px 0px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #8D91A5;
  padding: 12px 16px;
  height: 48px;
  border-bottom: 1px solid #8D91A5;
}

.modal__filter-input--selected {
  height: 72px;
  background: #DCDDE8;
  padding: 8px 16px;
}

.modal__filter-input--selected ion-label {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: #8D91A5;
}

.modal__filter-chips {
  margin-top: auto;
  gap: 8px;
  display: flex;
  overflow-x: scroll;
  width: 90%;
}

.modal__filter-chip {
  background: #8D91A5;
  border-radius: 16px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
  text-transform: capitalize;
  color: #FCFCFC;
  margin: 0;
  margin-top: auto;
  height: 32px;
  flex: 0 0 auto;
}

.modal__filter-chip ion-icon {
  color: #FCFCFC;
}

.modal__filter-input-icon {
  position: absolute;
  right: 20px;
  transform: translateY(-50%);
  top: 50%;
}

.modal__filter-input-items {
  padding: 0;
}


.modal__filter-input-item {
  --border-style: none;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #55596D;
}

.modal__filter-buttons {
  display: flex;
  width: 100%;
  gap: 16px;
  margin-top: auto;
}

.modal__filter-button {
  --background: #D0D7F9;
  --border-radius: 4px;
  width: 100%;
  --box-shadow: none;
  margin: 0;
  font-family: 'Readex Pro';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #5C6967;
  text-transform: capitalize;
  height: 48px;
}

.modal__filter-buttons--active {
  --background: #072AC8;
  color: #FDFDFD;
}

ion-popover {
  --backdrop-opacity: 1;
}

ion-popover::part(backdrop) {
  background-color: transparent;
}
</style>
