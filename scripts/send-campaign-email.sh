#!/bin/bash
# PMM Sherpa Email Campaign: Homepage Demo
# Sends personalized emails one-by-one via Gmail (GWS CLI)

SUBJECT="I ran my own homepage through PMMSherpa."
YOUTUBE_URL="https://youtu.be/ONkeE5T20Mk?si=p6N_nLePyPZlhc8-"
YT_THUMBNAIL="https://pmmsherpa.com/email/yt-thumbnail-demo01.png"
LOGO_URL="https://pmmsherpa.com/email/logo-blue.png"
APP_URL="https://pmmsherpa.com"

generate_html() {
  local FIRST_NAME="$1"
  cat <<EMAILEOF
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
            <tr>
              <td align="center" style="padding: 32px 0 16px 0;">
                <img src="${LOGO_URL}" alt="PMM Sherpa" width="56" height="56" style="border-radius: 12px;" />
              </td>
            </tr>
            <tr>
              <td style="padding: 0 40px 32px 40px;">
                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">Hey ${FIRST_NAME},</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">You know that moment when you're staring at your homepage copy and something feels off, but you can't tell if it's actually off or if you've just been looking at it too long?</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">I had that moment last week. So I did something I probably should have done earlier: I ran my own homepage through PMMSherpa.</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">It rewrote the whole thing. A little humbling, I won't lie. But it was also the best proof point I could have asked for, because it didn't just clean up my sentences. It strengthened the message underneath them.</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">That's the distinction most AI tools miss entirely. Copy is the words. Messaging is the foundation underneath the words: what your customer actually struggles with, what your product actually does about it, and the principles that hold up when someone pushes back.</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 24px 0;">I recorded the whole process. My old copy goes in, a sharper version comes out, and you can see exactly what changed and why.</p>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                  <tr>
                    <td align="center">
                      <a href="${YOUTUBE_URL}" target="_blank" style="display: block; text-decoration: none;">
                        <img src="${YT_THUMBNAIL}" alt="Watch the demo" width="520" style="max-width: 100%; border-radius: 8px; display: block;" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 10px;">
                      <a href="${YOUTUBE_URL}" target="_blank" style="font-size: 14px; color: #0058be; text-decoration: none; font-weight: 500;">&#9654; Watch the demo</a>
                    </td>
                  </tr>
                </table>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">If you've been meaning to revisit your own messaging, or if you've got a launch coming up and want to pressure-test your positioning before it goes live, this is a good time. PMMSherpa is free to try right now, for a limited time.</p>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <a href="${APP_URL}/chat" style="display: inline-block; background-color: #0058be; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Try PMMSherpa</a>
                    </td>
                  </tr>
                </table>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 32px 0 4px 0;">Talk soon,</p>
                <p style="font-size: 16px; color: #1f2937; margin: 0 0 4px 0;"><strong>Abhishek</strong></p>
                <p style="font-size: 14px; color: #6b7280; margin: 0;"><a href="mailto:support@pmmsherpa.com" style="color: #6b7280; text-decoration: none;">support@pmmsherpa.com</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="font-size: 13px; color: #9ca3af; margin: 0;"><a href="${APP_URL}" style="color: #9ca3af; text-decoration: none;">pmmsherpa.com</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
EMAILEOF
}

# Capitalize first letter helper
capitalize() {
  echo "$1" | sed 's/\(.\)/\U\1/'
}

SENT=0
FAILED=0

while IFS='|' read -r NAME EMAIL; do
  NAME=$(echo "$NAME" | xargs)  # trim whitespace
  EMAIL=$(echo "$EMAIL" | xargs)
  FIRST=$(capitalize "$NAME")

  echo "Sending to: $FIRST <$EMAIL>..."

  HTML=$(generate_html "$FIRST")

  if gws gmail +send --to "$EMAIL" --subject "$SUBJECT" --body "$HTML" --html 2>/dev/null; then
    echo "  ✓ Sent"
    SENT=$((SENT + 1))
  else
    echo "  ✗ FAILED"
    FAILED=$((FAILED + 1))
  fi

  # Small delay between sends
  sleep 2
done << 'USERLIST'
Shivangi|shivangit29@gmail.com
Ashit|ashit.ghevaria@gmail.com
Vinutha|vinutha.arian25@gmail.com
Melissa|mmiller2@atlassian.com
Abhishek|abhisheknellikkalaya@gmail.com
Max|maxlevinson5@gmail.com
Liudmyla|mekhedlyuda@gmail.com
Ishesh|ishesh.somani@inmobi.com
Kushal|kushalkh93@gmail.com
Ang|are941@gmail.com
Rahul|rahuldabke@gmail.com
Jeroen|jeroen@elevaide.com
Adam|adamlewkovitz@gmail.com
Aarthi|aardarsha@gmail.com
Alison|alimlieberman@gmail.com
Vishal|vnaik@box.com
Anoop|aviyer@gmail.com
Tanwistha|tanwistha108@gmail.com
Desiree|desiree@n8n.io
Sanjay|sanjay_kidambi@outlook.com
Archit|architbindal@gmail.com
Saira|saira.parvez@gmail.com
Joakim|joakim.verdier@alex-ai.eu
Treshauna|hello@treshaunaprice.com
Molly|friederich.molly@gmail.com
Max|max.struller@gmail.com
Sheena|sheenaxchen@gmail.com
Peter|peter.daderko@gmail.com
Lara|lara.stiris@gmail.com
James|jpnguyen@gmail.com
Marissa|marissadorros@gmail.com
Sarah|sscaife@atlassian.com
Siddhartha|s@sidc.ai
Deepika|dee1pillai@gmail.com
Stuart|stuartpitts@outlook.com
Andrew|amorse@atlassian.com
Deepit|dsapru@gmail.com
Anthony|amocny@atlassian.com
Kaitlin|kbenz@atlassian.com
Lynne|lpogue@atlassian.com
Anubhav|tandon.anubhav@gmail.com
Robin|rgoldman@atlassian.com
Simon|chan.simon.w@gmail.com
Liz|ljohannesen@chanzuckerberg.com
Jason|jasonkaplan79@gmail.com
Preeti|pnangia16@gmail.com
Mackenzie|mackenzie.kerr@clio.com
Nate|nathan.levin@gmail.com
Dylan|dylan@seneca.io
Daniel|daniel.d.andrino@gmai.com
Renil|crenil@gmail.com
Mohales|mohalesdeis@gmail.com
Joshua|josh@ortelis.com
Kunal|kunalspunjabi@gmail.com
Nadine|nadine.finlay@figured.com
Tanuj|tanuj.saluja@gmail.com
Lorena|lorenadominguezcastillo@gmail.com
Monique|moniquerenaicarruthers@gmail.com
Chloe|chloe.f.reeves@gmail.com
Zulhay|zulhayalan@gmail.com
Visakan|visakan@shotspin.com
Tanya|tatyana_aj81@yahoo.com
Horacio|horacio.castillo@gmail.com
Osman|osmansja@gmail.com
Amit|amit.mayer@medminder.com
Larkland|larkland.morley@gmail.com
Paul|pauchio@gmail.com
Matthew|el_rolio@revo21.com
Shreyas|shreyassriram3@gmail.com
Monica|monicaashokac1998@gmail.com
Michael|foxvdlinde@gmail.com
Gauthami|gpolasani@gmail.com
Eliza|elizaho@checkmate.sg
Paolo|paolo@belcastro.com
Sandeeip|sandeeip.chincholkar@gmail.com
Raffaele|studiotrent8@gmail.com
Henry|henryawarduk+jcs6iuov@gmail.com
Luis|luis@capchase.com
Diana|diana.dragomir@gmail.com
Srinivasan|snivasram@gmail.com
Craig|craignorman@gmail.com
Kristi|kristi@cliniconex.com
John|jfilitz@cisco.com
Jasmeen|bal.jasmeen@gmail.com
Melanie|melanie.payeur@fieldnation.com
Aoife|aoife.meagher@hotmail.com
Pejmon|pkayvon@impel.ai
Emily|emily.cash@acclaim.ai
Leanna|leannajjackson@gmail.com
Andrii|a.l.shevchenko.ua@gmail.com
Mani|mani.makkar93@gmail.com
USERLIST

echo ""
echo "Done! Sent: $SENT | Failed: $FAILED"
