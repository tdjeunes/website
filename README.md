## Active vs. Archived Files

- Clone the latest master branch of https://github.com/tdjeunes/website
- ./scripts/deploy.sh
- This will give you a local URL like 0.0.0.0:51948, but your port may be different
- Visit that address
- Notice that on the home page, the list of antennes do not have flags associated because they are being pulled dynamically due to Import antennes from http://contenu.terredesjeunes.org to https://www.terredesjeunes.org alberto56/dcycle-tasks#3

- Then go to /don.html
- That page has flags on the antennes list because they are not being pulled dynamically
- In the codebase, if you do a search for "/scripts/fetch-new-content.js", you will notice 6 results:

  - ./docs/index.html
  - ./docs/cotedivoire.html
  - ...

- We are calling the above files "active" files and if you see the html code you can see
```<!-- ***ACTIVE FILE*** -->``` at the top of the file that indicates the active file.


- Then, if you search for "imagecache-tdj_thumb_small_sidemenu_default", you will find 20055 results in 365 files:

  - ./docs/burundi.html
  - ./docs/cotedivoire2679.html
   etc.

- We are calling the above files "archived" files and if you see the html code you can see
``` <!-- ***ARCHIVED FILE*** --> ``` at the top of the file that indicates the archived file.


Our approach to this site is that we want to fossilize those 365 pages. That means that every time we have a new feature or or improvement (for example alberto56/dcycle-tasks#3), we don't want to do it all html files, but only on "active" files.
