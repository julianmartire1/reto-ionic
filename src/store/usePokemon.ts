import { defineStore } from "pinia";

export const usePokemon = defineStore("pokemon", {
  state: () => ({ pokemon: null }),
  getters: {
    getPokemon(state): any {
      return state.pokemon;
    },
  },
  actions: {
    setPokemon(pokemon: any) {
      this.pokemon = pokemon;
    },
  },
});
