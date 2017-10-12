#!/bin/bash


#&& cat client/styles/main.min.css | sed -e 's/(\/fonts\/N/(\.\.\/fonts\/N/g' > client/styles/_main.min.css \

cd /home/student/Desktop/ClientSide/project/babble \
&& git checkout gh-pages \
&& git rm -f index.html \
&& git checkout master client/index.html \
&& git mv client/index.html index.html \
&& git checkout master client/styles/main.min.css  \
&& sed -i'' -e 's/<link href=\"styles\/main.min.css\" media=\"all\" type=\"text\/css\" rel=\"stylesheet\" \/>//' index.html \
&& sed -i'' -e 's/<\/title>/<\/title><style>/' index.html \
&& sed -i'' '/<style>/ r client/styles/main.min.css' index.html \
&& sed -i'' -e 's/<\/head>/<\/style><\/head>/' index.html \
&& rm -f client/styles/main.min.css \
&& rm -f scripts/main.min.js \
&& git checkout master client/scripts/main.min.js  \
&& mv client/scripts/main.min.js scripts/main.min.js \
&& git add scripts/main.min.js index.html \
&& git commit -a -S -m "Releasing project" \
&& git push origin gh-pages \
&& git checkout master

exit 0
