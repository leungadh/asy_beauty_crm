  What you need to do next (manual steps)                   
                                         
  Step 1 — Create Supabase project
  1. Go to https://supabase.com → New project → region Southeast Asia (Singapore)                                
  2. In the SQL editor, run the schema from the plan (the CREATE TABLE customers / visits + RLS policies)        
  3. Go to Project Settings → API → copy the Project URL and anon public key                                     
  4. Open data.jsx and replace lines 6–7:                                                                        
  const SUPABASE_URL  = 'https://YOUR_PROJECT.supabase.co';                                                      
  const SUPABASE_ANON = 'YOUR_ANON_KEY';                                                                         
                                                                                                                 
  Step 2 — Create app icons                                                                                      
  Create two PNG icons (icon-192.png, icon-512.png) — an "A" on a blue #2563eb background works well. Add them to
   the project folder.                                                                                           
                                                                                                                 
  Step 3 — Connect to Netlify                                                                                    
  Go to https://netlify.com → Add new site → Import from GitHub → select asy_beauty_crm → no build command,
  publish directory . → Deploy.                                                                                  
                                                            
  Step 4 — Run the migration                                                                                     
  After Supabase is set up: open the app, use Export JSON to download your localStorage data, then open
  migrate.html in a browser and follow the instructions to import it into Supabase.                              
                                                            
  Step 5 — Install on phone                                                                                      
  Once deployed to Netlify, open the URL in Safari (iPhone) → Share → Add to Home Screen.
                                                                                                                 
✻ Sautéed for 13m 31s                      
                                                                                                                 
※ recap: All code for the production upgrade is written and ready. The next step is creating a Supabase project  
  at supabase.com, running the schema SQL, then pasting the project URL and anon key into the top of data.jsx. 
  (disable recaps in /config) 

