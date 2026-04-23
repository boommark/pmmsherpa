#!/bin/bash
# PMM Sherpa — Maven Positioning Course Prospects Invite
# Sends to 184 new prospects who downloaded positioning slides but haven't signed up
# Suppresses: yash@glacis.com, rgoldman@atlassian.com, sscaife@atlassian.com

set -euo pipefail

SUBJECT="The positioning frameworks, applied to your product"
TEMPLATE="$(dirname "$0")/../email-drafts/maven-positioning-prospects.html"
HTML=$(cat "$TEMPLATE")

SUPPRESSED="yash@glacis.com rgoldman@atlassian.com sscaife@atlassian.com"

is_suppressed() {
  local email_lower=$(echo "$1" | tr '[:upper:]' '[:lower:]')
  for s in $SUPPRESSED; do
    if [ "$email_lower" = "$s" ]; then
      return 0
    fi
  done
  return 1
}

SENT=0
FAILED=0
SKIPPED=0

while IFS= read -r EMAIL; do
  EMAIL=$(echo "$EMAIL" | xargs)  # trim whitespace
  [ -z "$EMAIL" ] && continue

  if is_suppressed "$EMAIL"; then
    echo "  ⊘ Suppressed: $EMAIL"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  echo "Sending to: $EMAIL..."

  if gws gmail +send --to "$EMAIL" --subject "$SUBJECT" --body "$HTML" --html 2>/dev/null; then
    echo "  ✓ Sent"
    SENT=$((SENT + 1))
  else
    echo "  ✗ FAILED"
    FAILED=$((FAILED + 1))
  fi

  sleep 2
done << 'EMAILS'
carolkhung@gmail.com
lucy@zeroheight.com
faridasoliman@aucegypt.edu
miyukixrinnjp@gmail.com
assem.bensalah@gmail.com
prakhar.sharma@licious.com
bradley.engel@gmail.com
harsha16balakrishnan@gmail.com
yash@glacis.com
ziyaad.b.eydatoula@gmail.com
julie0376@gmail.com
dev.vilav@gmail.com
mark@marknorgren.com
pm23.harsh@gmail.com
samit.thange.keep.learning@gmail.com
JazzMD@gmail.com
jmdecker44@gmail.com
ddanyoo@gmail.com
henry.hang@turingspace.co
palak13071992@gmail.com
akshay.g1@gmail.com
james.dalziel@halma.com
ganeshramakrishnanbr@gmail.com
roccogold23@gmail.com
carbon.alterd@gmail.com
mail@pedrocustodio.com
shanny.goldschmid@gmail.com
lililili.wang@gmail.com
khaaisn@gmail.com
etai.coles@gmail.com
jtanner@appliedframeworks.com
yildiriu@gmail.com
james.milo@gmail.com
tatyana.aj@gmail.com
bianca@plancraft.de
rforstie@qualtrics.com
Martin_Michelsen@hotmail.com
taarak.sawant@gmail.com
ayan109@gmail.com
rajbir.dadhiyala@gmail.com
liaojxsir@gmail.com
shahul.rashik@armorcode.io
Amit.Mayer@gmail.com
tran.jarrod@gmail.com
emiliosixto@playtomic.io
chaitanya.apte@fluentinhealth.com
stmbwork@gmail.com
bageshrikale@gmail.com
zovighian23@gmail.com
skaldiro@gmail.com
roberto.bautistafregoso@gmail.com
mirfaan.imamdin@gmail.com
vaishali.s.shriram@gmail.com
macekovick@gmail.com
alexwbi95@gmail.com
kapoorvishal@gmail.com
irina@besirius.io
fedulka17@gmail.com
ola.ania.mazurkiewicz@gmail.com
rajesh.shrestha@gmail.com
jazgar@google.com
azwandi@gmail.com
arpan.joshi@gmail.com
echailazopoulou@convertgroup.com
nirfig@gmail.com
jialin.eliza@gmail.com
kalyvask@stanford.edu
juliatsoihk@gmail.com
aviralv@gmail.com
muralidsmd@gmail.com
goldberg.haley@gmail.com
cagilduzenli@gmail.com
k.ho@sleekflow.io
lokendra.proddev@gmail.com
a.nabatova@gmail.com
sostarecdina@gmail.com
pavan.bathla@gmail.com
henk@isoflow.co.za
vinbh83@gmail.com
bermudez.edgardo@gmail.com
benhartney@gmail.com
nitin@diligencevault.com
sudharsan454@gmail.com
williamwong09@gmail.com
ashwingupta.work@gmail.com
gourisivakanth@gmail.com
shou7us@gmail.com
agrawalparth08@gmail.com
pete.lobrutto@gmail.com
e.cash@aiforiatech.com
ryhinsha@gmail.com
vanessafpra@gmail.com
audreydelrosario@gmail.com
itsashwin24@gmail.com
kpanc@ucdavis.edu
vonpependorf@gmail.com
mokohcs@gmail.com
dhpahina@gmail.com
amit.erental@gmail.com
samyukthakvs0304@gmail.com
dsaidoulger@gmail.com
anabel.morgal@lodgify.com
rimu.nitrkl@gmail.com
enrique.blanco@storicard.com
walter.leal@katapultlabs.ai
clairewelcomesummer@gmail.com
shubhamgolghate16@gmail.com
p005202005202@gmail.com
george.grgiev@gmail.com
sriramsd77@gmail.com
drochman@gmail.com
chinasamichaels27@gmail.com
hesterpamela@gmail.com
vincentjdipaola@gmail.com
milanlathia@gmail.com
yaarahendel@gmail.com
shobhnaj11@gmail.com
aadhar99@gmail.com
tigersharkcoder@gmail.com
vrunda739@gmail.com
rafakiki@gmail.com
gaurav@productscale.xyz
sergey.katerinich@gmail.com
devashish751@gmail.com
Lauren.Ambielli@gmail.com
harshithac94@gmail.com
imogen.lovera@algolia.com
ragan.lisa@gmail.com
VBulut1@gmail.com
carol.henriques@agendor.com.br
elenawong1031@gmail.com
c.becker@billiger-mietwagen.de
rcritikachaudhary95@gmail.com
jgelinas@withluminary.com
gatis.setlers@luminorgroup.com
chavana.melissa@gmail.com
ajdivalerio@gmail.com
ollenka.pavlova@gmail.com
karan@revvue.ai
rileyla83@gmail.com
andytran188@gmail.com
kzhou.kenny@gmail.com
johnfilitz@gmail.com
justin@samarasanctuary.studio
ahmedalbahar86@gmail.com
keensoon@gmail.com
etorpaul.e@gmail.com
ArtemisMeli@gmail.com
arijit.duttaec36@gmail.com
fandab3ar@gmail.com
nataliag@spacelift.io
bastian.c.kuelzer@gmail.com
johannwalter2@gmx.de
hayesmollyc@gmail.com
fame.razak@gmail.com
oliver.gardiner@zocdoc.com
chuyan.cecilia.li@gmail.com
trokltyg90@gmail.com
visakan101@gmail.com
ann4ever@gmail.com
graham.collie@aylo.com
nirat.adi@gmail.com
daniel.d.andrino@gmail.com
h13037@astra.xlri.ac.in
olga.khp@gmail.com
christoph@circuly.io
abhinavsingh2391@gmail.com
anirbanpx2020@email.iimcal.ac.in
swapnigupta07@gmail.com
hussainaww@gmail.com
carolmhenriques@gmail.com
yliao88@gmail.com
liamconnerton@gmail.com
yanirlvs@gmail.com
jits.aps90@gmail.com
orenparag@gmail.com
akao90@gmail.com
muriel0605@gmail.com
christinadrum8@gmail.com
lberson@bersondeanstevens.com
piyush.bhutoria98@gmail.com
scongdon@gmail.com
palvesraritan0@gmail.com
Claire.Buckingham@gmail.com
EMAILS

echo ""
echo "Done! Sent: $SENT | Failed: $FAILED | Suppressed: $SKIPPED"
