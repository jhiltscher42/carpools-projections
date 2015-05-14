/*
Problem we're interested in: A Community of some number C of people wants to use a pool of cars of size X for typical usage patterns.
Each car has a cost-per-mile
Each car has a finite-but-unknown lifespan before it needs replacement.
Members of the community make plans for outings of various lengths, 
  and have different tolerances for scheduling: whenever, scheduled, emergency.
Failure to deliver on emergencies should be considered a critical failure of the system.
Failure to deliver on scheduled should be considered a lesser failure, and should be measured and reported in mean-minutes-late.
*/

/*
How to model this?

A community is a list of people in a location.

A community of one person could be served for all needs with a pool of one car, trivially.  Could add one car that only responds to 
   Emergency level events for added safety.

A community of two people could be served 100% with a pool of two cars+2 emergency only cars.  It could be adequate with 1 car if
both people tolerated short delays.  Worst non emergency case, both schedule outings to be delivered at the same time .. hmm.  
If the system had time, it could pick up person A and drop them off early with enough time to pick up person B and get them to
their destination on time.  It'd be nice to have a way to calculate the lead time necessary to make this always happen, as that
would be the main way to reduce the required pool size.  It would also be necessary to detect the pathological condition of needing 
to deliver a person *the day before* to guarantee early-or-on-time for the set.  That would seem to be a function of the maximum
distance to travel possible. It would also be a function of how many people are in the community.  Pathological worst case would
be there's 24 people, each wanting to travel an hour.  Given 49+ hours, one car could do that, but the first person would be 
delivered 48+ hours early, with one arrival every two hours thereafter.  Pathological worst case time would then be 
number_of_people*max_distance*(1+possible_round_trips*2)/number_of_cars_in_pool.

To cope with that worst case, it seems like the number_of_cars_in_pool should be no less than half number_of_people.  And proper lead
time would be the same as the pathological worst case.  So lets see... 24 people.  12 cars.  Max distance 30 mins.  12 people at 8am say
they need to be at that far distance at 9:30am, and all cars are in pool... so the system schedules them for pick up... ah... it optimizes by
trying to conserve cars.  We put a damper in, the requests get batched.  It randomly divides each batch, and tells half that they'll be
picked up for drop off an hour early (so that it has time for another full round trip), and the other half will be dropped off on time.  
That way, if the other 12 people need to go the same distance 15 mins later, we still have the same ratio.  We can *still* get screwed.
One person calls at 8am for a 9:30am drop off.  12 call 5 mins later for a 9:35am.  First person get's scheduled for 9:00am pickup.  6 get
scheduled for 9:05am, 6 get scheduled for 8:05am.  5 minutes after that, the other 11 call and want 9:40am.  6 get scheduled for 9:10am,
5 get scheduled for 8:10am.  

6 of the 12 cars are out of the pool at 8:05am.  6 people served.  
11 of the 12 are out at 8:10am.                  11 people served
12 of the 12 are out at 9am.                     12 people served
6 come back ready at 9:05.                       12 people served
12 of the 12 are out at 9:05 again.              18 people served
5 come back ready at 9:10am                      18 people served
12 of the 12 are out at 9:10 again.              23 people served, 1 person left!
1 comes back ready at 9:30am
*/
