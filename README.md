Steedex-Express
========================
DEMO
--------------
- WEB : http://steedex.herokuapp.com/
- MOBILE : https://play.google.com/store/apps/details?id=tn.seif.steedex&hl=fr&gl=US

TOOLS
--------------
1. Symfony
2. Firebase
3. JWT
4. SECURITY
5. Doctrine
6. PrintPDF
7. FCM

Requirements
--------------
1. Composer
2. PHP >= 5.6 
6. MySQL

Clone
--------------
```bash
git clone https://github.com/SeifBh/steedex-express
```

Installation
--------------
1. Change app/config/paramter.yml file & generate database
```bash
php bin/console doctrine:database:create
```
2. Generate Schema
```bash
php bin/console doctrine:schema:update --force
```
Run
--------------
```bash
php bin/console server:run
```