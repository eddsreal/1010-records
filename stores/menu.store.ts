import { create } from 'zustand'

type MenuStoreType = {
	currentRoute: string
}

export const useMenuStore = create<MenuStoreType>()((set) => ({
	currentRoute: '/',
}))
