# VIPS Field Observation App - Photo
> Technical details about photo component

## Features
### 1. Capture photo through camera
### 2. Select photo from stored location
### 3. Store and retrive photo from IndexedDB
### 4. Store and retrive photo reference in localstorage


## IndexedDB
### Images stored in Base64 format. 
Images stored in ```<observationId>_illustration_<sequence number>.jpg``` (e.g. 8_illustration_26.jpg)

``` 
Database Name   : db-index-observation
Entity Name     : entityPhoto 
Index on        : observationId & organismId
Databse version : 1
```
## Important methods
### fetchFromServer()
> Extracts image data from VIPS server and call required methods to store in local databases

### storeData( )
> This method called other method  ```  createEntity( ) ``` to create objectStore, indexes and store raw image data in IndexedDB

### getImageFromStore ( )
> This method retrive image data and call method ``` displayImage( ) ``` for display image in thumbnail

### getImageDataFromStore ( )
>This method responsible to retrive the raw image data from indexdb and display in modal form

### storeImage( )
> It is a highlevel method which define image file name and prefix of raw image data. Eventually it calls two methods for actual storage of the information and data. It calls method ``` addImageIntoObservation( ) ``` for storing image information in ``` localstorage  ``` and ``` storeData( ) ``` for storing images.

### deleteImageByFileName( )
> It's a highlevel method for removing image from local system and mark for removal at server.
Inherently it calls method ``` deleteImageFromLocalStore( ) ``` to remove reference from ``` localstorage``` and ``` deleteImageFromIndexedDB( ) ``` to remove raw imagedata from IndexedDB.




