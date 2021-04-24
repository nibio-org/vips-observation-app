import Vue from 'vue'
import Router from 'vue-router'
import ObservationList from '@/components/ObservationList'
import PlacesList from '@/components/PlacesList'
import Settings from '@/components/Settings'
import Observation from '@/components/Observation'
import CropCategory from '@/components/CropCategory'
import MapObservation from '@/components/MapObservation'
import MapPOI from '@/components/MapPOI'
import Quantification from '@/components/Quantification'

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
      component: Observation,
      props:true
    },
    {
      path: '/cropCategory',
      name: 'CropCategory',
      component: CropCategory
    },
    {
      path: '/MapObservation',
      name: 'MapObservation',
      component: MapObservation
    },
    {
      path : '/MapPOI',
      name : 'MapPOI',
      component : MapPOI
    },
    {
      path : '/Quantification',
      name : 'Quantification',
      component : Quantification
    }    

  ]
})
