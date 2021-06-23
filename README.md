# strapi-plugin-import-csv
strapi plugin to import csv (that works with relations and file upload)

# How to install

1 - Clone inside _yourStrapiProject_/plugins
(The name of the folder should be import-csv)

`git clone https://github.com/afonsobspinto/strapi-plugin-import-csv.git import-csv`

2 - Install the plugin dependencies 

# How to use

1. Import all simple type (not relations) content first:
(Tick the import as media checkbox if you want the plugin to upload the file content)

![image](https://user-images.githubusercontent.com/19196034/123139884-96f35880-d44e-11eb-8249-2c936fe82c66.png)


2. Import the relations:
("Match on" referes to what column should be used as identifier of the entity to update and therefore it is required)

![image](https://user-images.githubusercontent.com/19196034/123140077-cc984180-d44e-11eb-9ad6-0451d47c6279.png)



Based on [how-to-create-an-import-content-plugin](https://strapi.io/blog/how-to-create-an-import-content-plugin-part-1-4)
