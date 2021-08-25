# VIPS Field Observation App - Sync
> Technical details about Sync process

## Features
### 1. One way sync 
> One way Sync  received the required data from Server and overwrites to local (normally local storage)
<br>
Affected data in Ony way sync
```
Crop category
Crop list
Pest list
Crop-pest list
Polygon service
```
Data in one way sync stored in localstorage system.

### 2. Two way Sync
>Two way sync is little complex process whether both the client (app) and VIPS Server exchange updated data between each other.
<br>
Affected data in two way sync :
```
Observation List
Point of Interest (POI) List
```
In Two way Sync, text data stored in localstorage system and image data stored in local IndexedDB

## Important methods
### syncOneWay()
> This is a high level method for one way sync. It finds which data to sync and it's correponding fetch url from server. it inherently call method ``` oneWaySyncStorageSet ``` to talk to VIPS server, get the required data and overwrite in localstorage and call inherently a method ``` setOneWaySyncStatus ``` to mark the data to end Sync service.

### isSyncOnewayNeeded()
>This is a high level method to call three different methods upon one way sync in three different situations.
```
syncOneWayEmptyProduct()
syncOneWayDifferentUser()
syncOneWayDifferentTimeStamp()
```
### syncOneWayEmptyProduct()
> Normaly this method runs at very intial stage or any condition when product list is empty

### syncOneWayDifferentUser()
> This oneway sync works upon change of user in same device

### syncOneWayDifferentTimeStamp ()
> This one way sync works when data changes in server with different timestamp

### syncTwoWay()
>As mentioned earlier, two way sync works mainly on Observations and Point of Interests. 
<br>
This function decides which services (Observation / Point of interest) required and call method  ``` syncTwoWayInitiate() ``` for initiate two way sync.

### syncTwoWayPOI()
>High level method which inherently call a method ``` syncPOISendPrepare() ``` to prepare two way sync for Point Of Interest

### syncPOIPOST()
>POST new and modified POI data from app to VIPS

### updatePOIPOST()
> Update local system from VIPS Server response

### getPOIFromServerTwowaySync()
> Get new or modified POI data from VIPS Server

### removeLocalPOI()
> Remove POI data from localstorage

### syncTwoWayObservation()
>High level method which inherently call a method ``` syncObservationSendPrepare() ``` to prepare two way sync for Observations

### syncObservationSendPrepareSingleObject()
>This method get / extracts new or modified data both from localstorage and IndexedDB and create a merge to create a single object and prepare for sending to VIPS server

### syncObservationPOST()
>Posting Observation data from local system to VIPS server for two way sync.

### updateObservationPOST()
>Update observations at local system from VIPS server response

### getObservationsFromServerTwowaySync()
>Get new or modified Observation data from VIPS Server and stored in local system. It inherently calls a method ``` fetchImageFromServer() ``` which receives image data from VIPS server for specific observation

### storeImageData()
> Extracted raw image data received from VIPS server stored in IndexedDB.

### removeLocalObservation()
> Remove observation from localstorage

### removeImageRecord()
> Remove image from IndexedDB






