import Vue from 'vue'
import Router from 'vue-router'
import ObservationList from '@/components/ObservationList'
import PlacesList from '@/components/PlacesList'
import Settings from '@/components/Settings'
import Observation from '@/components/Observation'
import CropCategory from '@/components/CropCategory'


Vue.use(Router)

export default new Router({
  routes: [
     {
      path: '/',
      name: 'ObservationList',
      component: ObservationList
    }, 
    {
      path: '/places',
      name: 'PlacesList',
      component: PlacesList
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    },
    {
      path: '/observation',
      name: 'Observation',
      component: Observation
    },
    {
      path: '/cropCategory',
      name: 'CropCategory',
      component: CropCategory
    }

  ]
})
