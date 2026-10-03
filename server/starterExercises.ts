import {query,transaction} from './storage';

// Written summaries based on NASM's linked form guides, with their demonstration videos.
// Default sets/reps are editable app starting values, not individual training prescriptions.
const entries = [
  ['push-up','Push-Up','Chest','Chest','Beginner','WDIpL0pjun0',
    'Keep your trunk firm and move your chest and hips together. Avoid dropping your hips or spreading your elbows sideways.',
    ['Set your palms a little wider than your shoulders and extend your legs behind you.','Brace your abdomen and keep your head, hips, and heels aligned.','Bend your elbows diagonally backward and lower your chest with control.','Press through your palms to return to the top without losing body alignment.']],
  ['modified-push-up','Modified Push-Up','Chest','Chest','Beginner','PDr5B2jLUOw',
    'Use knee support to reduce the load while keeping a firm line from your knees through your head.',
    ['Place your knees on a mat and your hands just outside shoulder width.','Keep your hips extended and gently brace your abdomen.','Bend your elbows and lower your chest, keeping your trunk steady.','Push back up with control and repeat without letting your hips sag.']],
  ['incline-push-up','Incline Push-Up','Chest','Chest','Beginner','0JUrOH--Kdk',
    'Place your hands on a sturdy elevated surface that cannot slide. Keep your body aligned as you lower and press.',
    ['Rest your palms on a stable bench or countertop, slightly wider than shoulder width.','Step your feet back until your body forms a straight diagonal line.','Bend your elbows and bring your chest toward the surface.','Press away from the surface, maintaining a steady trunk.']],
  ['prisoner-squat','Prisoner Squat','Legs','Quadriceps','Beginner','UYbsgiiZgao',
    'Keep your heels grounded and your knees tracking with your feet. Lower only as far as you can keep an upright, controlled posture.',
    ['Stand with your feet about hip width and place your hands lightly behind your head.','Brace your abdomen and keep your chest lifted.','Bend your hips and knees to lower your body toward a seated position.','Push through your feet to stand tall again without letting your knees collapse inward.']],
  ['floor-bridge','Floor Bridge','Legs','Glutes','Beginner','Z3cY3d3BBo4',
    'Lift with your glutes rather than arching your lower back. Keep the movement slow and your knees steady.',
    ['Lie on your back with bent knees, flat feet, and arms beside you.','Place your feet about hip width and brace your abdomen.','Press through your feet and lift your hips until shoulders, hips, and knees align.','Lower your hips smoothly and repeat without overextending your back.']],
  ['bird-dog','Bird Dog','Core','Abs','Beginner','ZdAHe9_HeEw',
    'Reach opposite limbs while keeping your back and pelvis still. Choose a shorter reach if your body begins to rotate.',
    ['Begin on hands and knees with hands under shoulders and knees under hips.','Brace your abdomen and keep your back in a comfortable neutral position.','Reach one arm forward while extending the opposite leg behind you.','Bring both limbs back slowly, then repeat on the other side.']],
  ['dead-bug','Dead Bug','Core','Abs','Beginner','bxn9FBrt4-A',
    'Move opposite limbs slowly and keep your lower back supported. Reduce the reach if your back begins to arch.',
    ['Lie on your back with your arms pointing upward and hips and knees bent to right angles.','Brace your abdomen while keeping your lower back gently against the floor.','Reach one arm overhead as the opposite leg extends away from you.','Return to the starting position and alternate sides with control.']],
  ['plank','Plank','Core','Abs','Beginner','mwlp75MS6Rg',
    'Hold a straight body line while breathing normally. End the hold when you can no longer keep your hips and back steady.',
    ['Rest your forearms on the floor with elbows below your shoulders.','Extend your legs and support yourself on your toes.','Brace your abdomen and keep your head, hips, and heels in line.','Hold steadily without sagging, then lower your knees and rest.']],
  ['side-plank','Side Plank','Core','Obliques','Intermediate','44ND4bOB-T0',
    'Keep your supporting elbow under your shoulder and avoid twisting your torso. Perform the hold on both sides.',
    ['Lie on one side with your legs extended and feet stacked or staggered.','Set your forearm on the floor with your elbow directly below your shoulder.','Brace your abdomen and raise your hips to form a straight body line.','Hold with steady breathing, lower with control, and switch sides.']],
  ['jumping-jacks','Jumping Jacks','Cardio','Full Body','Beginner','uLVt6u15L98',
    'Coordinate your arms and legs and land with soft knees. Step one foot outward at a time for a lower-impact version.',
    ['Stand with your feet together and arms beside you, leaving space around your body.','Jump your feet apart as you lift your arms overhead.','Land softly with your knees slightly bent.','Jump your feet together as your arms return to your sides, then repeat.']],
  ['pike-push-up','Pike Push-Up','Shoulders','Shoulders','Advanced','2b5t0Cu2nQI',
    'Maintain an inverted V shape and control the lowering phase. This is a more demanding pressing movement than a regular push-up.',
    ['Place your hands on the floor and lift your hips to form an inverted V.','Brace your abdomen and keep your head aligned comfortably with your spine.','Bend your elbows to lower your head toward the floor without resting your weight on it.','Press through your palms to return to the starting position.']],
  ['childs-pose',"Child's Pose",'Yoga','Upper Back','Beginner','_ZX_zTOBgp8',
    'Ease into a comfortable stretch instead of forcing your hips backward. Relax your shoulders and breathe slowly.',
    ['Begin on hands and knees on a mat.','Move your hips gently toward your heels while reaching your hands forward.','Rest your forehead on the mat or a comfortable support and breathe steadily.','Walk your hands back and return upright slowly.']],
] as const;

export const starterExercises=entries.map(([slug,name,category,muscleGroup,difficulty,videoId,instructions,steps],i)=>({
  id:`starter-${slug}`,name,category,muscleGroup,difficulty,
  equipment:slug==='childs-pose'?'Yoga Mat':'No Equipment',
  instructions,steps:steps.join('\n'),defaultSets:3,
  defaultReps:['plank','side-plank','childs-pose'].includes(slug)?1:10,
  defaultDuration:30,restTime:60,caloriesPerSet:0,
  videoUrl:`https://www.youtube.com/watch?v=${videoId}`,
  sourceUrl:`https://www.nasm.org/resource-center/exercise-library/${slug}`,
  videoSource:'NASM',image:null,order:i,
}));

export async function seedExercises(){
  await transaction(async()=>{
    if((await query('SELECT id FROM migrations WHERE id = ?',['starter-exercises-v1'])).length)return;
    const existing=(await query('SELECT data FROM records WHERE table_name = ?',['Exercises'])).map(r=>JSON.parse(r.data));
    const names=new Set(existing.map(e=>String(e.name).toLowerCase()));
    const seededAt=Date.now();
    for(const entry of starterExercises){
      if(names.has(entry.name.toLowerCase()))continue;
      const created=new Date(seededAt-entry.order).toISOString();const {order,...exercise}=entry;
      await query('INSERT INTO records(id,table_name,owner,data,created) VALUES(?,?,?,?,?)',[exercise.id,'Exercises','',JSON.stringify({...exercise,createdAt:created}),created]);
    }
    await query('INSERT INTO migrations(id) VALUES(?)',['starter-exercises-v1']);
  });
}
