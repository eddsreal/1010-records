import { Category, Priority } from "@/common/interfaces/priorities.interfaces";
import { create } from "zustand";

type PrioritiesStoreType = {
  priorities: Priority[];
  categories: Category[];
  categoryId: number;
};

export const usePrioritiesStore = create<PrioritiesStoreType>(() => ({
  priorities: [
    {
      id: 1,
      name: "Esenciales",
      description: "Descripción Esenciales",
      icon: "icon",
      color: "red",
      suggestedCategories: [
        {
          id: 1,
          name: "Arriendo",
          description: "Descripción Arriendo",
          icon: "icon",
          color: "red",
        },
        {
          id: 2,
          name: "Mercado",
          description: "Descripción Mercado",
          icon: "icon",
          color: "red",
        },
      ],
      categories: [],
    },
    {
      id: 2,
      name: "Obligaciones Financieras",
      description: "Descripción Obligaciones",
      icon: "icon",
      color: "blue",
      suggestedCategories: [
        {
          id: 3,
          name: "Deuda Bancolombia",
          description: "Descripción Deuda Bancolombia",
          icon: "icon",
          color: "blue",
        },
        {
          id: 4,
          name: "Deuda Av Villas",
          description: "Descripción Deuda Av Villas",
          icon: "icon",
          color: "blue",
        },
      ],
      categories: [],
    },
    {
      id: 3,
      name: "Ahorro",
      description: "Descripción Ahorro",
      icon: "icon",
      color: "green",
      suggestedCategories: [
        {
          id: 5,
          name: "Carro",
          description: "Descripción Carro",
          icon: "icon",
          color: "green",
        },
        {
          id: 6,
          name: "Mejoras al hogar",
          description: "Descripción Mejoras al hogar",
          icon: "icon",
          color: "green",
        },
      ],
      categories: [],
    },
    {
      id: 4,
      name: "No Esenciales",
      description: "Descripción Gastos No Esenciales",
      icon: "icon",
      color: "yellow",
      suggestedCategories: [
        {
          id: 7,
          name: "Gimnasio",
          description: "Descripción Gimnasio",
          icon: "icon",
          color: "yellow",
        },
        {
          id: 8,
          name: "Netflix",
          description: "Descripción Netflix",
          icon: "icon",
          color: "yellow",
        },
      ],
      categories: [],
    },
    {
      id: 5,
      name: "Objetivos",
      description: "Descripción Objetivos a corto y mediano plazo",
      icon: "icon",
      color: "purple",
      suggestedCategories: [
        {
          id: 9,
          name: "Regalos Navidad",
          description: "Descripción Regalos Navidad",
          icon: "icon",
          color: "purple",
        },
        {
          id: 10,
          name: "Llantas para el carro",
          description: "Descripción Llantas para el carro",
          icon: "icon",
          color: "purple",
        },
      ],
      categories: [],
    },
  ],
  categoryId: 10,
  categories: [],
}));
