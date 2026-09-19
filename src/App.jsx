import "./firebaseStorage";
import { useState, useEffect, useMemo } from "react";
import {
  MountainSnow, Mountain, Snowflake, Sun, TreePine, Waves, Wheat, Wind, Anchor, Layers,
  Flame, CloudRain, Sprout,
  Building2, Home, Factory, Ship, Trees, Landmark, TrainFront, Tent, Warehouse,
  GraduationCap, Ticket, Scale,
  Compass, Globe, Satellite, Flag, BarChart3, Book, Ruler, Rows3, Columns3,
  Trophy, Lock, CheckCircle2, Star, User, Award, LogOut, ArrowLeft,
  Users, Medal, X, Check, Sparkles,
} from "lucide-react";

/* ---------- Design tokens ---------- */
const COLORS = {
  ink: "#1B2A38",
  inkSoft: "#28394A",
  parchment: "#EEE6D3",
  parchmentDeep: "#E3D8BE",
  gold: "#C99A3B",
  moss: "#5C7A5C",
  teal: "#2F5D62",
  rust: "#B5563C",
  ink70: "rgba(27,42,56,0.7)",
};
const STAGE_COUNT = 10;
const QUESTIONS_PER_STAGE = 20;
const PASS_THRESHOLD = 12; // out of 20

/* ---------- Board 1: terrain regions (Human & Physical levels) ---------- */
const REGIONS = [
  { id: "tundra", name: "Tundra Reach", icon: Snowflake, color: "#8FB8C9", x: 12, y: 16 },
  { id: "frostpeak", name: "Frostpeak Range", icon: MountainSnow, color: "#9AA7C7", x: 42, y: 10 },
  { id: "highlands", name: "Windward Highlands", icon: Layers, color: "#8C9E7E", x: 68, y: 20 },
  { id: "desert", name: "Sunveil Desert", icon: Sun, color: "#D9A24B", x: 86, y: 38 },
  { id: "volcanic", name: "Emberridge Volcanics", icon: Flame, color: "#C1502E", x: 95, y: 15 },
  { id: "rainforest", name: "Verdant Rainforest Basin", icon: TreePine, color: "#3F7A4F", x: 28, y: 46 },
  { id: "steppe", name: "Windrun Steppe", icon: Sprout, color: "#9CAA5B", x: 8, y: 50 },
  { id: "wetland", name: "Marshveil Wetlands", icon: CloudRain, color: "#5C8CA6", x: 40, y: 60 },
  { id: "delta", name: "Emerald River Delta", icon: Waves, color: "#3D8C86", x: 55, y: 52 },
  { id: "savanna", name: "Savanna Grasslands", icon: Wheat, color: "#C7A64B", x: 20, y: 74 },
  { id: "peninsula", name: "Stormcoast Peninsula", icon: Wind, color: "#6C7A99", x: 78, y: 64 },
  { id: "archipelago", name: "Coral Archipelago", icon: Anchor, color: "#3E8E82", x: 52, y: 88 },
];

/* ---------- Board 2: city districts (Urban level) ---------- */
const DISTRICTS = [
  { id: "cbd", name: "Central Business District", icon: Building2, color: "#5B6B8C", x: 50, y: 22 },
  { id: "civic", name: "Civic / Government District", icon: Scale, color: "#4B5D67", x: 38, y: 18 },
  { id: "suburb", name: "Residential Suburb", icon: Home, color: "#93A76C", x: 18, y: 30 },
  { id: "industrial", name: "Industrial Zone", icon: Factory, color: "#8C7A6B", x: 82, y: 28 },
  { id: "campus", name: "Educational District", icon: GraduationCap, color: "#7A6BAF", x: 25, y: 45 },
  { id: "transit", name: "Transit Hub", icon: TrainFront, color: "#6C6C9E", x: 68, y: 40 },
  { id: "oldtown", name: "Historic Old Town", icon: Landmark, color: "#B08B4F", x: 55, y: 48 },
  { id: "greenbelt", name: "Green Belt / Park Zone", icon: Trees, color: "#4F8A5B", x: 30, y: 62 },
  { id: "entertainment", name: "Entertainment District", icon: Ticket, color: "#C9598B", x: 62, y: 68 },
  { id: "port", name: "Waterfront / Port District", icon: Ship, color: "#3D8C86", x: 88, y: 58 },
  { id: "informal", name: "Informal Settlement", icon: Tent, color: "#B5563C", x: 14, y: 68 },
  { id: "periurban", name: "Peri-urban Fringe", icon: Warehouse, color: "#A99A6B", x: 44, y: 84 },
];

/* ---------- Question pools ---------- */

// Stage 1 — Remembering: recall facts and definitions directly
const POOL_HUMAN_REMEMBER = [
  { clue: "In the word Geography, what does 'Geo' mean?", options: ["Earth", "Map", "People", "Sky"], correct: 0, rationale: "Geo comes from the Greek word for 'Earth,' forming the root of the term geography." },
  { clue: "What does 'Graphein' mean in the word Geography?", options: ["To govern", "To write, describe, or map", "To travel", "To measure"], correct: 1, rationale: "Graphein is Greek for 'to write or describe,' so geography literally means writing about the Earth." },
  { clue: "Who is widely known as the 'Father of Geography'?", options: ["Aristotle", "Ptolemy", "Eratosthenes", "Pythagoras"], correct: 2, rationale: "Eratosthenes was an ancient Greek scholar credited with pioneering systematic methods for studying and measuring the Earth." },
  { clue: "What did Eratosthenes famously calculate with remarkable accuracy?", options: ["The distance to the moon", "The Earth's circumference", "The speed of ocean currents", "The population of Egypt"], correct: 1, rationale: "Using shadow angles measured at two distant locations, Eratosthenes estimated the Earth's circumference with remarkable accuracy for his time." },
  { clue: "What is Human Geography?", options: ["The study of rocks and minerals", "The study of people, culture, and society and how they interact with places", "The study of ocean currents", "The study of the solar system"], correct: 1, rationale: "Human Geography studies people, their cultures, and societies, and how they interact with the places they live in." },
  { clue: "What is Population Geography?", options: ["The study of ancient ruins", "The branch of geography studying the distribution, growth, and movement of human populations", "The study of soil chemistry", "The study of star formation"], correct: 1, rationale: "Population Geography specifically focuses on how human populations are distributed, how they grow, and how they move across space." },
  { clue: "How is Migration best defined?", options: ["A daily commute to work", "The movement of people to live somewhere temporarily or permanently", "Trading goods between countries", "Sending money across borders"], correct: 1, rationale: "Migration is the movement of people to live in a new place, whether temporarily or permanently." },
  { clue: "What is a Push factor in migration?", options: ["A factor that attracts people to a new place", "A factor that drives people away from a place", "A type of population pyramid", "A tool for measuring distance"], correct: 1, rationale: "A push factor is a negative condition in a person's current location, such as conflict or lack of jobs, that drives them to leave." },
  { clue: "What is a Pull factor in migration?", options: ["A factor that drives people away from a place", "A factor that attracts people to a new place", "A type of refugee status", "A government tax policy"], correct: 1, rationale: "A pull factor is a positive condition in a new location, such as opportunity or safety, that draws people toward it." },
  { clue: "What is Culture?", options: ["A country's official currency", "Shared beliefs, values, customs, and ways of life of a group", "A type of landform", "A government's foreign policy"], correct: 1, rationale: "Culture refers to the shared beliefs, values, customs, and practices that define a group's way of life." },
  { clue: "What is Cultural Diffusion?", options: ["The disappearance of a culture", "The spread of cultural traits from one place or group to another", "A law banning foreign customs", "A method of counting population"], correct: 1, rationale: "Cultural diffusion is the process by which cultural traits, ideas, or practices spread from one place or group to another." },
  { clue: "How is birth rate measured?", options: ["Live births per 1,000 people per year", "Total children in one household", "Percentage of married couples", "Number of hospitals in a region"], correct: 0, rationale: "Birth rate is expressed as the number of live births per 1,000 people per year, which allows fair comparisons between places of different sizes." },
  { clue: "What is the movement of people INTO a place called?", options: ["Emigration", "Immigration", "Diffusion", "Displacement"], correct: 1, rationale: "Immigration refers specifically to people entering a country or place to settle there." },
  { clue: "What is the movement of people OUT of a place called?", options: ["Immigration", "Diffusion", "Emigration", "Convergence"], correct: 2, rationale: "Emigration refers specifically to people leaving their country or place of origin." },
  { clue: "Who are Refugees?", options: ["Tourists visiting for leisure", "People forced to leave their country due to war or persecution, unable to safely return", "Business travelers", "Students studying abroad by choice"], correct: 1, rationale: "Refugees are people forced to flee due to danger such as war or persecution, and who cannot safely return home." },
  { clue: "What is a densely populated area?", options: ["An area where very few people live", "An area where many people live in a small space", "An area with no permanent residents", "An area used only for farming"], correct: 1, rationale: "A densely populated area has a large number of people living within a small amount of space." },
  { clue: "What is a sparsely populated area?", options: ["An area where many people live close together", "An area where only a small number of people live across a large space", "A city center", "An industrial zone"], correct: 1, rationale: "A sparsely populated area has very few people spread across a large amount of space." },
  { clue: "What is Worldometer?", options: ["A history textbook", "An online platform providing real-time population estimates", "A weather forecasting tool", "A type of population pyramid"], correct: 1, rationale: "Worldometer is an online platform that aggregates data to provide continuously updated, real-time population statistics." },
  { clue: "What does 'monotheistic' mean?", options: ["Belief in many gods", "Belief in only one God", "Belief in no god", "Belief in ancestor spirits"], correct: 1, rationale: "The prefix 'mono-' means 'one,' so monotheistic religions center on belief in a single God." },
  { clue: "Which religion is historically associated with Israel and is one of the world's oldest monotheistic religions?", options: ["Hinduism", "Buddhism", "Judaism", "Christianity"], correct: 2, rationale: "Judaism originated in the region now largely occupied by Israel and is one of the earliest religions to teach belief in a single God." },
  { clue: "About how many distinct dialects does the Philippines have?", options: ["10", "170", "500", "840"], correct: 1, rationale: "The Philippines' mountainous terrain and many islands historically isolated communities, allowing over 170 distinct dialects to develop." },
  { clue: "What is a Cultural Landscape?", options: ["A map showing only rivers and mountains", "The visible imprint of human culture on the physical environment", "A type of population pyramid", "A government census report"], correct: 1, rationale: "A cultural landscape is the visible mark people leave on their natural surroundings as they shape it to fit their culture and needs." },
];

// Stage 2 — Understanding: explain, classify, and interpret concepts
const POOL_HUMAN_UNDERSTAND = [
  { clue: "Which of these belongs to Human Geography rather than Physical Geography?", options: ["Climate", "Mountains", "Migration", "Rivers"], correct: 2, rationale: "Migration involves human decisions and movement, which is why it falls under Human Geography rather than Physical Geography." },
  { clue: "Which of these belongs to Physical Geography rather than Human Geography?", options: ["Religion", "Urbanization", "Climate", "Migration"], correct: 2, rationale: "Climate is a natural atmospheric condition rather than a human activity, which is why it belongs to Physical Geography." },
  { clue: "What sets Modern Geography apart from traditional geography?", options: ["It only draws maps", "It explains why things happen where they do", "It ignores human activity", "It focuses only on history"], correct: 1, rationale: "Traditional geography focused on describing and mapping locations, while modern geography goes further to explain the causes behind spatial patterns." },
  { clue: "Why are deserts and extremely cold regions usually sparsely populated?", options: ["Governments prohibit settlement there", "Harsh conditions make them less suitable for large-scale settlement", "They have too many available jobs", "It is illegal to build homes there"], correct: 1, rationale: "Extreme temperatures and limited resources like water make it difficult to sustain large populations in these environments." },
  { clue: "Why do densely populated areas tend to form around cities?", options: ["Cities generally offer more jobs, schools, and services", "Cities have colder climates", "Cities have less available land", "Cities are always located in deserts"], correct: 0, rationale: "Cities concentrate jobs, schools, and services, which draws and sustains larger populations." },
  { clue: "Which best explains the difference between a push factor and a pull factor?", options: ["Push factors attract people; pull factors repel them", "Push factors drive people away for negative reasons; pull factors attract people for positive reasons", "Both mean the same thing", "Push factors only apply to animals, not people"], correct: 1, rationale: "Push factors are negative conditions that force people to leave, while pull factors are positive conditions that draw people toward a new place." },
  { clue: "Which best explains why rugged terrain often leads to many distinct languages in a region?", options: ["Mountains and dense terrain isolate communities, letting language evolve independently", "Rugged terrain has no effect on language", "Governments require different languages per province", "Rugged terrain always has zero population"], correct: 0, rationale: "When mountains or dense terrain separate communities, each group's language can evolve independently over time, producing greater diversity." },
  { clue: "Which best explains Relocation Diffusion?", options: ["Culture spreads because people physically move to a new place", "Culture disappears when people move away", "Culture spreads only through television", "Culture stays fixed regardless of migration"], correct: 0, rationale: "In relocation diffusion, a cultural trait only reaches a new place because the people carrying it physically move there." },
  { clue: "Which best explains Hierarchical Diffusion?", options: ["Culture spreads randomly with no pattern", "Culture spreads from influential people or important places to others", "Culture spreads only through relocation", "Culture spreads only within a single household"], correct: 1, rationale: "Hierarchical diffusion follows a structured path, spreading from influential people, cities, or institutions outward to the wider population." },
  { clue: "Which best explains Cultural Convergence?", options: ["Cultures becoming more different over time", "Cultures becoming more similar due to interaction and globalization", "A culture disappearing entirely", "A culture becoming isolated from all others"], correct: 1, rationale: "As societies interact more through trade, media, and technology, their practices and values increasingly come to resemble one another." },
  { clue: "Which best explains Cultural Divergence?", options: ["Cultures becoming more similar", "Cultural differences being maintained or becoming more distinct", "Cultures merging into one", "A population shrinking rapidly"], correct: 1, rationale: "When groups deliberately preserve their customs or remain isolated, their cultural differences persist or even grow stronger over time." },
  { clue: "Why does a population pyramid with a wide base suggest rapid growth?", options: ["It shows a large number of children relative to older age groups", "It shows more elderly people than children", "It shows equal numbers at every age", "It has no relation to birth rates"], correct: 0, rationale: "A wide base reflects a large number of young children being born, which signals rapid population growth." },
  { clue: "Why does a narrow-based population pyramid suggest an aging population?", options: ["There are more children being born each year", "There are fewer children being born relative to older adults", "The death rate has dropped to zero", "Migration has stopped completely"], correct: 1, rationale: "A narrow base means fewer children are being born relative to older generations, a pattern typical of an aging population." },
  { clue: "Which best explains why governments study population dynamics?", options: ["To plan schools, hospitals, and housing based on population needs", "To decide on national holidays", "To design flags and currency", "To choose a country's official language"], correct: 0, rationale: "Knowing current and future population size and structure lets governments allocate resources like schools and hospitals effectively." },
  { clue: "Which best explains the difference between international and internal migration?", options: ["International migration crosses country borders; internal migration stays within one country", "They mean the same thing", "Internal migration always involves more people", "International migration never affects population size"], correct: 0, rationale: "The defining difference is whether the move crosses a national border — internal migration stays within one country." },
  { clue: "Which best summarizes why people migrate for economic reasons?", options: ["They are forced to leave by their government", "They seek better-paying jobs or income opportunities elsewhere", "They are fleeing a natural disaster", "They want to visit family for a holiday"], correct: 1, rationale: "Economic migration is driven by the search for improved income or employment opportunities." },
  { clue: "Which best explains why a Cultural Landscape like the Banaue Rice Terraces is significant?", options: ["It shows how people modified the environment based on their culture and needs", "It is a naturally occurring landform with no human involvement", "It represents a population pyramid", "It is an example of a push factor"], correct: 0, rationale: "The terraces show how people physically reshaped mountainous terrain to fit their farming traditions, making them a clear cultural landscape." },
  { clue: "Which best distinguishes a monotheistic religion from a polytheistic one?", options: ["Monotheistic believes in one God; polytheistic believes in many gods", "They mean the same thing", "Monotheistic has no god at all", "Polytheistic worships ancestors only"], correct: 0, rationale: "The key difference is the number of gods worshipped — one for monotheistic religions, many for polytheistic ones." },
  { clue: "Which best explains why a well-managed, growing population can strengthen a country's economy?", options: ["A larger workforce and more consumers can support economic growth", "More people always leads to less economic activity", "Population size has no effect on the economy", "It only benefits the government, not businesses"], correct: 0, rationale: "A larger workforce and consumer base can boost production and demand, strengthening the economy when supported by adequate infrastructure." },
  { clue: "Which best explains why physical and human geography are considered complementary fields?", options: ["Physical geography explains the natural environment, while human geography explains how people interact with it", "They study completely unrelated things", "Human geography replaced physical geography", "Physical geography only exists in textbooks"], correct: 0, rationale: "Physical geography explains the natural environment, while human geography explains how people interact with and adapt to that environment." },
  { clue: "Which best explains why tracking births, deaths, and migration helps predict a country's future needs?", options: ["It shows whether a population is growing, shrinking, or aging, which affects future demand for services", "It only matters for historical record-keeping", "It has no connection to public services", "It is only used for tourism planning"], correct: 0, rationale: "Tracking these trends shows whether a population is growing, shrinking, or aging, which directly informs what services and infrastructure will be needed in the future." },
];

// Stage 3 — Applying: use the concepts on new, concrete scenarios
const POOL_HUMAN_APPLY = [
  { clue: "A family moves from a rural province to Manila to find better job opportunities. This is an example of:", options: ["Urban to Rural migration", "Rural to Urban migration", "International migration", "Rural to Rural migration"], correct: 1, rationale: "Moving from the countryside into a city is the definition of rural-to-urban migration." },
  { clue: "A student from the Philippines moves to Canada to study for a degree. This is an example of:", options: ["Internal migration", "Rural to Urban migration", "International migration", "Seasonal migration"], correct: 2, rationale: "Crossing a national border to live and study in another country makes this international migration." },
  { clue: "A worker moves from Quezon City to Makati, another city in Metro Manila, for a new job. This is an example of:", options: ["Urban to Urban migration", "Rural to Rural migration", "International migration", "Emigration only"], correct: 0, rationale: "Both Quezon City and Makati are urban areas, so this move stays within the urban-to-urban category." },
  { clue: "A farmer relocates from one rural town to another rural town to access better farmland. This is an example of:", options: ["Urban to Urban migration", "Rural to Rural migration", "International migration", "Urban to Rural migration"], correct: 1, rationale: "Both the starting point and destination are rural, making this rural-to-rural migration." },
  { clue: "A city dweller moves back to the province to retire in a quieter setting. This is an example of:", options: ["Rural to Urban migration", "Urban to Urban migration", "Urban to Rural migration", "International migration"], correct: 2, rationale: "Moving from a city back to a rural area fits the definition of urban-to-rural migration." },
  { clue: "War breaks out in a region, forcing many families to flee their homes. This scenario best illustrates a:", options: ["Pull factor", "Push factor", "Cultural landscape", "Population pyramid"], correct: 1, rationale: "Violence and danger are negative conditions that drive people away, which is exactly what defines a push factor." },
  { clue: "A region offers strong job opportunities and safety, drawing many new residents. This scenario best illustrates a:", options: ["Push factor", "Pull factor", "Cultural divergence", "Death rate increase"], correct: 1, rationale: "Attractive conditions like opportunity and safety are what draw people toward a place, making this a pull factor." },
  { clue: "Filipino migrants abroad continue cooking adobo and sinigang in their new home country. This is an example of:", options: ["Hierarchical diffusion", "Relocation diffusion", "Cultural divergence", "Contagious diffusion"], correct: 1, rationale: "The cultural practice reached the new country only because the people who practice it physically relocated there." },
  { clue: "A celebrity's fashion choice goes viral and becomes popular nationwide after appearing on social media. This is an example of:", options: ["Relocation diffusion", "Hierarchical diffusion", "Cultural divergence", "Rural migration"], correct: 1, rationale: "The trend spread outward from an influential figure to the wider public, following the pattern of hierarchical diffusion." },
  { clue: "A city's population pyramid shows a very wide base and a narrow top. Based on this shape, the city is most likely experiencing:", options: ["Zero population growth", "Rapid population growth", "A declining population", "No births at all"], correct: 1, rationale: "A wide base means many young children are being born, a clear sign of rapid population growth." },
  { clue: "A country's population pyramid is nearly rectangular, with similar numbers at almost every age group. This suggests:", options: ["Rapid population growth", "Zero population growth", "A refugee crisis", "Total population collapse"], correct: 1, rationale: "Roughly equal numbers across age groups mean births and deaths are balanced, producing zero population growth." },
  { clue: "A coastal town has reliable water access, fertile soil, and flat land. Based on population distribution factors, this town would most likely be:", options: ["Sparsely populated", "Densely populated", "Completely uninhabited", "A desert region"], correct: 1, rationale: "Reliable water, fertile soil, and flat land support agriculture and settlement, which typically leads to higher population density." },
  { clue: "A mountainous area has poor transportation access and a harsh climate. Based on population distribution factors, this area would most likely be:", options: ["Densely populated", "Sparsely populated", "An urban center", "A major trade hub"], correct: 1, rationale: "Difficult terrain and limited access make it hard to sustain a large population, resulting in low density." },
  { clue: "A country's fast-food chains, streaming shows, and social media trends become nearly identical to those of its neighbors. This illustrates:", options: ["Cultural divergence", "Cultural convergence", "A push factor", "A declining birth rate"], correct: 1, rationale: "Increasingly similar cultural practices across nations is a hallmark of cultural convergence." },
  { clue: "An indigenous community keeps its traditional language and religious practices despite outside influence. This illustrates:", options: ["Cultural convergence", "Cultural divergence", "Relocation diffusion", "A pull factor"], correct: 1, rationale: "Maintaining distinct customs despite outside influence reflects cultural divergence rather than blending in." },
  { clue: "A region reports a high birth rate and a low death rate. Based on this, its population is most likely:", options: ["Shrinking", "Increasing", "Staying exactly the same", "Impossible to determine"], correct: 1, rationale: "When more people are born than die, the population naturally grows." },
  { clue: "After noticing a rising number of young families in a district, a government builds more schools and clinics there. This is an application of:", options: ["Cultural diffusion", "Population Geography", "Cultural divergence", "International migration policy"], correct: 1, rationale: "This is a direct application of population data — using it to plan services for a growing demographic." },
  { clue: "A delivery rider uses GPS to find the fastest route to a customer's address. This is an everyday application of:", options: ["Traditional geography", "Modern geography", "Population geography only", "Cultural geography only"], correct: 1, rationale: "Using satellite-based tools to solve a real-world navigation problem is a practical, everyday application of modern geography." },
  { clue: "Tourists try a country's street food and slang, then bring these habits home to share with friends. This best represents:", options: ["Hierarchical diffusion", "Relocation diffusion", "Cultural divergence", "A push factor"], correct: 1, rationale: "The cultural traits spread because the tourists themselves physically traveled and then carried the practices back home." },
  { clue: "Two neighboring towns share access to the same river for water and trade. Based on population distribution factors, both towns would most likely be:", options: ["Sparsely populated", "Densely populated compared to areas without such access", "Completely abandoned", "Classified as deserts"], correct: 1, rationale: "Shared access to water for use and trade supports agriculture and exchange, which tends to sustain higher population density in both towns." },
];

// Stage 4 — Analyzing: break down relationships, causes, and effects
const POOL_HUMAN_ANALYZE = [
  { clue: "What is the most likely relationship between rapid rural-to-urban migration and city housing shortages?", options: ["They are unrelated", "More people moving to cities increases housing demand faster than it can be built", "Housing shortages cause migration to slow down completely", "Rural-to-urban migration always reduces housing demand"], correct: 1, rationale: "When people move to cities faster than housing can be built, demand outpaces supply, causing shortages." },
  { clue: "Which best differentiates Cultural Convergence from Cultural Divergence?", options: ["Convergence makes cultures more similar through interaction; divergence makes differences more distinct", "They are two names for the same process", "Convergence only happens through war", "Divergence only happens in cities"], correct: 0, rationale: "Convergence and divergence describe opposite trends — cultures becoming more alike versus becoming more distinct." },
  { clue: "Which best explains the cause-and-effect relationship between a high birth rate and a wide-based population pyramid?", options: ["They are unrelated statistics", "A high birth rate produces many young children, creating a wide base in the pyramid", "A wide base is caused only by low death rates", "A wide base means the population is shrinking"], correct: 1, rationale: "More births directly add more people to the youngest age group, which widens the base of the population pyramid." },
  { clue: "Which best explains why physical factors alone don't fully determine where people settle?", options: ["Physical factors are the only thing that matters", "Human factors like jobs, security, and infrastructure also strongly influence settlement", "Human factors never affect settlement patterns", "Only climate determines settlement"], correct: 1, rationale: "Even favorable physical conditions won't attract settlement if human factors like jobs or safety are missing, showing both types of factors matter together." },
  { clue: "Which best contrasts a push factor with a pull factor in migration?", options: ["Push factors involve negative reasons that drive people away; pull factors involve positive reasons that attract people", "They both describe the same kind of reason for migrating", "Push factors only apply to international migration", "Pull factors only apply to refugees"], correct: 0, rationale: "Push factors repel people from a place for negative reasons, while pull factors attract people to a place for positive reasons — they act in opposite directions." },
  { clue: "Which best explains the relationship between geographic isolation and language diversity?", options: ["Isolated communities develop independently, leading to many distinct languages over time", "Isolation always eliminates local languages", "Language diversity has no connection to geography", "Isolated areas always share one universal language"], correct: 0, rationale: "When physical barriers prevent easy interaction between communities, their languages evolve independently, producing greater diversity over time." },
  { clue: "Which best differentiates Relocation Diffusion from Hierarchical Diffusion?", options: ["Relocation spreads culture through people physically moving; hierarchical spreads from influential people or places to others", "They describe the exact same process", "Relocation only happens online", "Hierarchical diffusion requires physical movement of people"], correct: 0, rationale: "Relocation diffusion requires people to physically move, while hierarchical diffusion spreads through influence and status without necessarily requiring migration." },
  { clue: "Which best explains why a country with both high immigration and a high birth rate would grow rapidly?", options: ["Both factors add to the population faster than losses from deaths or emigration", "Immigration always cancels out birth rate effects", "Only one factor can affect population at a time", "High immigration always causes population decline"], correct: 0, rationale: "Both factors add people to the population at the same time, compounding the overall rate of growth." },
  { clue: "Which best explains the connection between education access and migration patterns?", options: ["Education access has no effect on migration", "People often migrate toward areas offering better schools, affecting population distribution", "Migration always reduces access to education", "Only refugees consider education when moving"], correct: 1, rationale: "Families often relocate specifically to access better schools, directly linking education to migration patterns." },
  { clue: "Which best distinguishes internal migration from international migration in terms of a country's total population?", options: ["Internal migration doesn't change a country's total population, only its distribution; international migration changes the total", "Both change a country's total population equally", "Internal migration always increases total population", "International migration never affects population"], correct: 0, rationale: "Moving within a country only redistributes the existing population, while crossing a border actually changes the total population count for both countries involved." },
  { clue: "Which best explains why a narrow-based population pyramid could create future economic challenges?", options: ["Fewer young workers may eventually need to support a larger elderly population", "A narrow base always means immediate economic collapse", "It guarantees a growing workforce", "It has no economic implications"], correct: 0, rationale: "With fewer young workers entering the workforce, there may not be enough people to support a growing elderly population's needs." },
  { clue: "Which best explains the relationship between globalization and cultural diffusion?", options: ["Globalization has no effect on how culture spreads", "Globalization increases contact between societies, speeding up the spread of cultural traits", "Globalization only affects trade, not culture", "Globalization always causes cultural divergence"], correct: 1, rationale: "Greater global connectivity through trade, travel, and media speeds up how quickly cultural traits spread between societies." },
  { clue: "Which best explains why brain drain is considered a negative effect of migration for a home country?", options: ["The home country gains more resources than it loses", "The country loses skilled workers who could have contributed to its own development", "Brain drain only affects the destination country", "It has no impact on either country"], correct: 1, rationale: "When skilled workers leave, the home country loses the expertise and productivity they could have contributed locally." },
  { clue: "Which best explains the difference in purpose between Modern Geography and Traditional Geography?", options: ["Traditional geography mainly describes and maps places, while modern geography explains why things happen and how humans and environments interact", "They have identical purposes", "Traditional geography focuses only on human behavior", "Modern geography only studies ancient maps"], correct: 0, rationale: "Traditional geography mapped and described the world, while modern geography analyzes the reasons behind spatial patterns and human-environment interactions." },
  { clue: "Which best explains why government policy can act as a human factor in population distribution?", options: ["Policies like housing projects or tax incentives can encourage or discourage settlement in specific areas", "Government policy never affects where people live", "Only physical factors influence settlement decisions", "Policies only affect birth rates, not settlement"], correct: 0, rationale: "Deliberate policy choices, like housing incentives, can directly shape where people choose to settle, making policy a human factor." },
  { clue: "Which best explains the relationship between fertile soil, water supply, and population density?", options: ["These factors have no connection to population size", "Areas with fertile soil and reliable water can support agriculture and sustain larger populations", "Fertile soil always leads to sparse population", "Water supply only matters in deserts"], correct: 1, rationale: "Good farming conditions can support more food production, which in turn can sustain a larger population in that area." },
  { clue: "Which best explains why world religions have different geographic distributions?", options: ["Religions spread historically through migration, trade, and cultural exchange, concentrating in certain regions", "All religions are distributed equally worldwide", "Religious distribution is completely random", "Geography has no influence on religion"], correct: 0, rationale: "Religions historically spread along trade routes and through migration, which explains why they became concentrated in particular regions." },
  { clue: "Which best explains why urban areas tend to attract more rural-to-urban migrants over time?", options: ["Cities generally offer more job opportunities, services, and infrastructure than rural areas", "Rural areas always offer more jobs than cities", "Urban areas have stricter migration laws", "Migration to cities has no clear cause"], correct: 0, rationale: "Cities' concentration of jobs and services makes them consistently more attractive destinations compared to rural areas." },
  { clue: "Which best explains the link between population dynamics and sustainable development planning?", options: ["Population data has no use in planning", "Tracking birth rates, death rates, and migration helps governments prepare resources for future needs", "Development planning ignores population entirely", "Only economic data matters for development planning"], correct: 1, rationale: "Understanding population trends lets planners anticipate future needs for housing, jobs, and infrastructure before shortages occur." },
  { clue: "Which best explains why some countries with strong economies still lose skilled workers to emigration?", options: ["Strong economies never lose workers", "Other countries may offer even higher pay or better opportunities, pulling skilled workers away", "Emigration only happens in weak economies", "Skilled workers never consider moving abroad"], correct: 1, rationale: "Even a strong economy can lose skilled workers if another country offers even better pay or opportunities, since migration decisions are relative, not absolute." },
  { clue: "Which best explains the connection between transportation infrastructure and population distribution?", options: ["Transportation has no effect on where people choose to live", "Areas with better roads and transit are easier to access, making them more attractive for settlement", "Only rural areas benefit from good transportation", "Infrastructure only affects tourism, not settlement"], correct: 1, rationale: "Areas that are easier to reach tend to attract more settlement, since good accessibility makes daily life and business more convenient." },
];

// Stage 5 — Evaluating: judge, justify, and recommend
const POOL_HUMAN_EVALUATE = [
  { clue: "Which policy would most effectively reduce housing shortages caused by rapid rural-to-urban migration?", options: ["Ignoring the growth and hoping it slows on its own", "Investing in urban housing and infrastructure planning", "Banning people from moving to cities", "Reducing the number of schools in the city"], correct: 1, rationale: "Investing in housing and infrastructure directly addresses the shortage, rather than ignoring it or restricting people's freedom to move." },
  { clue: "Which approach would most effectively help a country manage the effects of a rapidly aging population?", options: ["Ignoring healthcare and pension planning", "Strengthening healthcare, pension systems, and workforce policies for older adults", "Reducing the retirement age to zero support", "Discouraging all forms of immigration"], correct: 1, rationale: "Strengthening healthcare, pensions, and workforce policy directly supports the needs of a growing elderly population." },
  { clue: "Which strategy would best help a community preserve its cultural identity while still benefiting from globalization?", options: ["Rejecting all outside influence completely", "Promoting local traditions and languages while selectively embracing beneficial outside influences", "Abandoning local traditions entirely", "Ignoring the effects of globalization altogether"], correct: 1, rationale: "A selective approach lets a community keep its core traditions while still gaining benefits from global exchange, rather than choosing either extreme." },
  { clue: "Which factor should a government prioritize first when planning services for a rapidly growing young population?", options: ["Building enough schools and healthcare facilities for children", "Building more retirement homes", "Reducing the number of hospitals", "Limiting access to education"], correct: 0, rationale: "A growing population of children needs adequate schooling and healthcare first to support a healthy, productive future generation." },
  { clue: "Which of these best justifies why understanding push and pull factors matters for policymakers?", options: ["It has no real use for policy decisions", "It helps them design programs addressing the root causes of migration and manage its effects", "It only matters for tourism marketing", "It is only relevant to historians"], correct: 1, rationale: "Understanding these factors helps policymakers design programs that address the actual causes of migration rather than just its symptoms." },
  { clue: "Which of these best evaluates the overall impact on a home country that loses many skilled professionals to emigration?", options: ["It always benefits the home country immediately", "It can weaken the home country's development unless offset by returning skills or remittances", "It has no impact on the home country at all", "It only affects the destination country's economy"], correct: 1, rationale: "Without returning skills or remittances to offset the loss, a home country's development can be weakened when it loses skilled professionals." },
  { clue: "Which recommendation would best balance the economic benefits and social costs of population growth for a country?", options: ["Restrict all population growth immediately", "Invest in education, jobs, and family planning support to make growth sustainable", "Ignore population growth entirely", "Rely only on emigration to control population size"], correct: 1, rationale: "Investing in education, jobs, and family planning support allows growth to continue in a way that stays manageable and beneficial." },
  { clue: "Which of these best evaluates the claim that cultural convergence is entirely positive?", options: ["The claim is fully accurate with no downsides", "It can bring people together globally, but may also weaken unique local traditions", "Cultural convergence never happens in the real world", "It only benefits large countries"], correct: 1, rationale: "Convergence brings people together but can also erode unique local traditions, so it carries both benefits and drawbacks rather than being purely positive." },
  { clue: "Which of these best evaluates the claim that 'population growth is always bad for a country'?", options: ["The claim is accurate in all cases", "The claim is inaccurate; a well-managed population can strengthen the economy through a larger workforce", "Population size never affects a country's economy", "Only population decline can benefit an economy"], correct: 1, rationale: "A well-managed population can actually strengthen an economy through a larger workforce and increased economic activity, so the blanket claim is inaccurate." },
  { clue: "Which of these best evaluates relying only on physical factors to explain why people settle somewhere?", options: ["It is a complete and sufficient explanation on its own", "It is insufficient, since human factors like jobs, safety, and policy often play an equally strong role", "Physical factors are irrelevant to settlement", "Only government policy explains settlement patterns"], correct: 1, rationale: "Relying only on physical factors ignores how strongly jobs, safety, and policy also shape where people choose to settle." },
  { clue: "Which of these best evaluates using GPS and satellite technology for disaster preparedness?", options: ["It has no real benefit for communities", "It significantly improves early warning, though its impact still depends on how communities respond", "It guarantees zero damage from any disaster", "It is only useful for everyday navigation, not disasters"], correct: 1, rationale: "These tools significantly improve early warning, but their real-world impact still depends on how effectively communities act on the information." },
  { clue: "Which of these best justifies preserving endangered local languages in linguistically diverse areas?", options: ["Local languages have no real cultural value", "Languages carry unique cultural knowledge and identity that would be permanently lost otherwise", "Only widely spoken languages are worth preserving", "Preserving languages has no connection to cultural identity"], correct: 1, rationale: "Each language carries unique cultural knowledge and identity that would be permanently lost if it disappears, which justifies preservation efforts." },
  { clue: "Which of these best evaluates a city that accepts large numbers of rural-to-urban migrants without expanding infrastructure?", options: ["It will have no negative effects on the city", "It is likely to worsen problems like overcrowding, traffic, and pressure on public services", "It automatically improves quality of life for everyone", "Infrastructure has no relationship to migration"], correct: 1, rationale: "Without expanding infrastructure to match population growth, problems like overcrowding and strained public services tend to worsen." },
  { clue: "Which of these best evaluates the long-term risk for a country with very low birth rates and rising life expectancy?", options: ["There is no long-term risk at all", "A shrinking workforce may struggle to support a growing elderly population over time", "Low birth rates always guarantee economic growth", "Rising life expectancy has no economic implications"], correct: 1, rationale: "A shrinking pool of young workers may eventually struggle to support a growing elderly population, creating long-term economic strain." },
  { clue: "Which of these best justifies studying the geography of religion for community planning?", options: ["Religious distribution has no relevance to planning", "Understanding religious distribution helps communities respect diverse beliefs and plan appropriately", "Only one religion should be considered in any plan", "It is useful only for historical research"], correct: 1, rationale: "Understanding where different religious communities are concentrated helps planners respect diverse needs and beliefs in their decisions." },
  { clue: "Which of these best evaluates hierarchical diffusion as a way to spread beneficial ideas like health practices?", options: ["It always fails to spread any idea effectively", "It can spread ideas quickly, but effectiveness depends on whether the influential source is trustworthy", "It only works for spreading fashion trends", "It has no connection to health practices"], correct: 1, rationale: "This method can spread ideas quickly, but how well it works still depends on whether the influential source is seen as trustworthy." },
  { clue: "Which of these best evaluates a government choosing to invest heavily in infrastructure in areas that are losing population?", options: ["It is clearly the most effective use of resources", "It may be less effective than investing in growing areas with rising demand", "Population trends are irrelevant to infrastructure planning", "Losing population always increases infrastructure needs"], correct: 1, rationale: "Resources are often better spent in growing areas with rising demand than in places where population and need are declining." },
  { clue: "Which of these best justifies encouraging cultural exchange through migration rather than discouraging it?", options: ["Cultural exchange only causes conflict", "It can foster innovation, diversity, and mutual understanding between groups of people", "Migration should always be prevented", "Cultural exchange has no real benefits"], correct: 1, rationale: "Migration-driven cultural exchange can foster innovation, diversity, and mutual understanding, offering more benefit than simply restricting it." },
  { clue: "Which of these best evaluates a plan that only restricts immigration without addressing the push factors driving people to migrate?", options: ["It is a complete solution on its own", "It is likely incomplete, since it doesn't address the root causes forcing people to leave their home countries", "Push factors are irrelevant to migration policy", "Restricting immigration always eliminates migration"], correct: 1, rationale: "Without also addressing the conditions forcing people to leave their home countries, a restriction-only policy tends to be an incomplete solution." },
  { clue: "Which of these best evaluates prioritizing only economic pull factors when planning to attract new residents to a city?", options: ["Economic factors are the only thing that matters to people", "It may be incomplete, since safety, healthcare, and education also strongly influence settlement decisions", "Non-economic factors never affect migration decisions", "It guarantees a city will attract new residents"], correct: 1, rationale: "Focusing only on jobs ignores how safety, healthcare, and education also strongly influence where people choose to settle." },
  { clue: "Which of these best evaluates the long-term sustainability of a region that depends on a single natural resource to attract population and industry?", options: ["It carries little risk regardless of the resource's future", "It carries a high risk if the resource runs out or loses value, since the region's economy could decline sharply", "Single-resource economies are always the most stable", "Population and industry are unaffected by resource availability"], correct: 1, rationale: "An economy built around one resource carries high risk, since running out of or losing value in that resource could cause the local economy to decline sharply." },
];

// Stage 1 — Remembering: recall facts and definitions directly
const POOL_PHYSICAL_REMEMBER = [
  { a: "tundra", clue: "Which region has a polar climate, with permafrost and very little vegetation?", rationale: "A polar climate is defined by extremely cold temperatures and permafrost, which prevents most plant growth." },
  { a: "frostpeak", clue: "Which region is a mountain range formed by the folding of the Earth's crust?", rationale: "Fold mountains form when tectonic plates collide and push the crust upward into ranges like this one." },
  { a: "highlands", clue: "Which region is a plateau — an elevated area of relatively flat land?", rationale: "A plateau is defined as a raised, flat-topped landform, distinct from a mountain peak or a lowland." },
  { a: "desert", clue: "Which region has an arid climate with very low rainfall?", rationale: "Deserts are classified by their aridity — very little precipitation falls there year-round." },
  { a: "volcanic", clue: "Which region's landscape was shaped by eruptions and lava flow?", rationale: "Volcanic landscapes form from repeated eruptions that deposit lava and ash over time." },
  { a: "rainforest", clue: "Which region has a hot, humid equatorial climate with dense vegetation?", rationale: "Equatorial climates near the equator stay warm and wet year-round, supporting dense rainforest growth." },
  { a: "steppe", clue: "Which region is a temperate grassland, with hot summers and cold winters?", rationale: "Steppe climates are defined by this seasonal temperature extreme and grassland vegetation." },
  { a: "wetland", clue: "Which region is a wetland, saturated with water and rich in biodiversity?", rationale: "Wetlands are lands where water saturation is the defining feature, supporting unique plant and animal life." },
  { a: "delta", clue: "Which region is a river delta, where a river deposits sediment as it meets the sea?", rationale: "A delta forms specifically from sediment deposited where a river slows and meets a larger body of water." },
  { a: "savanna", clue: "Which region has a tropical wet-and-dry climate with seasonal grassland?", rationale: "Savanna climates alternate between a wet and a dry season, supporting grassland rather than forest." },
  { a: "peninsula", clue: "Which region is a peninsula — land surrounded by water on three sides?", rationale: "A peninsula is defined by this three-sided water boundary, distinguishing it from an island or mainland." },
  { a: "archipelago", clue: "Which region is an archipelago, a chain of islands?", rationale: "An archipelago is defined as a group or chain of islands clustered together." },
  { a: "frostpeak", clue: "Which region has the thinnest air and lowest oxygen levels, due to elevation?", rationale: "Air pressure and oxygen availability drop as elevation increases, which is most extreme at high mountain altitudes." },
  { a: "desert", clue: "Which region experiences the widest temperature swing between day and night?", rationale: "Dry air and lack of cloud cover let deserts lose heat quickly at night after intense daytime heating." },
  { a: "wetland", clue: "Which region acts as a natural filter, absorbing floodwater and pollutants?", rationale: "Wetland vegetation and soil naturally trap sediment and pollutants while absorbing excess water." },
];

// Stage 2 — Understanding: explain and interpret why these processes happen
const POOL_PHYSICAL_UNDERSTAND = [
  { a: "tundra", clue: "Why does permafrost make it hard for trees to grow in this region?", rationale: "Permanently frozen subsoil blocks root growth and drainage, which prevents most trees from establishing themselves." },
  { a: "frostpeak", clue: "Why are avalanches most likely to occur in this region?", rationale: "Steep slopes combined with heavy snow accumulation create unstable conditions that can trigger avalanches." },
  { a: "highlands", clue: "Why do rivers crossing this region often form waterfalls?", rationale: "Where a plateau's edge drops sharply to lower land, rivers flowing over it plunge down and form waterfalls." },
  { a: "desert", clue: "Why is wind, rather than water, the main force shaping this region's landscape?", rationale: "With so little rainfall, wind becomes the dominant erosional force, shaping dunes and rock formations." },
  { a: "volcanic", clue: "Why does this region tend to have unusually fertile soil?", rationale: "Volcanic ash breaks down into mineral-rich soil that is highly fertile for agriculture." },
  { a: "rainforest", clue: "Why is this region's soil often nutrient-poor despite its lush vegetation?", rationale: "Heavy rainfall washes nutrients out of the soil quickly, so most nutrients stay cycling in the living plants instead." },
  { a: "steppe", clue: "Why does this region support large-scale grain farming once cultivated?", rationale: "Deep, fertile soils built up over time by grassland roots make steppe regions well-suited to grain crops." },
  { a: "wetland", clue: "Why is this region considered critical habitat for migratory birds?", rationale: "The mix of water and vegetation provides food and shelter that migratory birds rely on during their journeys." },
  { a: "delta", clue: "Why is this region especially prone to flooding?", rationale: "Sediment constantly builds up at the river mouth, raising the land just enough that floodwaters spread easily." },
  { a: "savanna", clue: "Why can overgrazing push this region toward desertification?", rationale: "Removing too much grass cover exposes the soil, which can dry out and erode until it can no longer support vegetation." },
  { a: "peninsula", clue: "Why is this region more exposed to storm surge than an inland area?", rationale: "Being surrounded by water on three sides gives storm surges direct access to its coastline from multiple directions." },
  { a: "archipelago", clue: "Why are undersea volcanic eruptions often responsible for forming this kind of region?", rationale: "Repeated undersea eruptions build up material until it breaks the surface, forming a chain of volcanic islands." },
  { a: "tundra", clue: "Why could thawing ground in this region affect global climate?", rationale: "Thawing permafrost can release large amounts of trapped carbon and methane, both greenhouse gases." },
  { a: "highlands", clue: "Why does this region have a more moderate climate than the mountains above it?", rationale: "Its elevation is lower than true mountains, so temperatures are cooler than lowlands but milder than high peaks." },
  { a: "rainforest", clue: "Why does this region have the greatest biodiversity per square kilometer among these terrains?", rationale: "Stable warm temperatures and abundant rainfall year-round support an unusually large number of species." },
];

// Stage 3 — Applying: identify the region from a concrete scenario
const POOL_PHYSICAL_APPLY = [
  { a: "frostpeak", clue: "A hiker climbs steadily and notices the air becoming thin, making breathing difficult. Which region are they most likely in?", rationale: "Oxygen levels drop with elevation, so thin air at height signals a high mountain environment like this one." },
  { a: "volcanic", clue: "A geologist finds fresh volcanic rock and ash layering the ground. Which region are they surveying?", rationale: "Fresh ash and volcanic rock are the signature deposits of an active or recently active volcanic landscape." },
  { a: "steppe", clue: "A farmer wants to plant wheat and finds unusually deep, fertile soil on a flat, grassy plain with cold winters. Which region is this?", rationale: "Deep fertile soil under a grassland climate with cold winters matches a steppe environment, ideal for grain crops." },
  { a: "rainforest", clue: "A biologist records hundreds of species in a single square kilometer of dense, humid forest. Which region is this?", rationale: "Extremely high species density in a hot, humid forest is characteristic of a rainforest's biodiversity." },
  { a: "delta", clue: "A team maps a river that fans into multiple channels and deposits mud as it reaches the ocean. Which region is this?", rationale: "A fanning river mouth depositing sediment as it meets the sea is the defining feature of a delta." },
  { a: "desert", clue: "Travelers notice they haven't seen a single tree in days, only sand dunes shifting in strong winds. Which region are they crossing?", rationale: "Sand dunes shaped by wind with no tree cover point to an arid desert environment." },
  { a: "wetland", clue: "Conservationists tag migratory birds resting in a shallow, marshy area between feeding and nesting sites. Which region is this?", rationale: "Shallow, marshy stopover habitat for migratory birds is a hallmark function of wetlands." },
  { a: "archipelago", clue: "A community relies on boats to travel between many small islands scattered across the sea. Which region do they live in?", rationale: "Relying on inter-island boat travel across a scattered group of islands describes life in an archipelago." },
  { a: "savanna", clue: "Herders move their cattle across an open plain that turns green in the rainy season and brown in the dry season. Which region is this?", rationale: "A grassland that shifts between green and brown with wet and dry seasons is characteristic of a savanna." },
  { a: "peninsula", clue: "Engineers plan a seawall because homes on this narrow strip of land are battered by waves from three sides during storms. Which region is this?", rationale: "Being exposed to waves from three sides during storms is typical of land surrounded by water on three sides." },
  { a: "tundra", clue: "Scientists drill into permanently frozen soil and find ancient plant matter preserved for thousands of years. Which region is this?", rationale: "Permanently frozen ground, or permafrost, is a defining feature of tundra that can preserve ancient organic matter." },
  { a: "highlands", clue: "A river drops suddenly over the edge of a flat-topped elevated landform, creating a dramatic waterfall. Which region is this?", rationale: "A sudden drop at the edge of an elevated, flat-topped landform producing a waterfall describes a plateau." },
  { a: "archipelago", clue: "Urban planners worry about rising seas slowly shrinking the total land area of this string of small islands. Which region is this?", rationale: "Small island chains are especially vulnerable to losing land area as sea levels rise." },
  { a: "peninsula", clue: "A satellite image shows a coastline constantly reshaped by crashing waves, with no river mouth nearby. Which region is this?", rationale: "A coastline reshaped mainly by wave action, without a river system, points to a peninsula's exposed coast." },
  { a: "delta", clue: "After a heavy storm, a low, flat area near a river mouth floods completely within hours. Which region is this?", rationale: "Deltas sit at low, flat elevations near sediment-choked river mouths, making them highly flood-prone." },
];

// Stage 4 — Analyzing: break down causes, effects, and relationships
const POOL_PHYSICAL_ANALYZE = [
  { a: "tundra", clue: "Which best explains why tundra regions release stored carbon as global temperatures rise?", rationale: "Warming thaws permafrost that has locked away carbon-rich organic matter for centuries, releasing it into the atmosphere." },
  { a: "frostpeak", clue: "Which best explains the relationship between elevation and vegetation in mountain regions?", rationale: "As elevation rises, temperature and oxygen drop, which limits which plants can survive at different heights." },
  { a: "highlands", clue: "Which best explains why plateaus often have distinct 'edge' waterfalls?", rationale: "Rivers crossing a plateau flow smoothly until they reach its steep edge, where the sudden elevation drop creates a waterfall." },
  { a: "desert", clue: "Which best explains why desert temperatures swing so widely between day and night?", rationale: "Dry air holds little moisture to trap heat, so deserts heat quickly by day and lose that heat rapidly after sunset." },
  { a: "volcanic", clue: "Which best explains why volcanic regions often attract farming despite eruption risks?", rationale: "The immediate danger of eruptions is offset by the long-term benefit of highly fertile, mineral-rich volcanic soil." },
  { a: "rainforest", clue: "Which best explains why rainforest soil stays nutrient-poor even though the vegetation is so lush?", rationale: "Frequent heavy rain washes nutrients out of the soil quickly, so most nutrients are held in the living plants rather than the ground." },
  { a: "steppe", clue: "Which best explains why steppe regions became major grain-producing areas once cultivated?", rationale: "Centuries of grassland root growth built up deep, nutrient-rich soil that is highly productive once plowed for crops." },
  { a: "wetland", clue: "Which best explains the connection between wetlands and flood control?", rationale: "Wetland soil and plants absorb and slow excess water, reducing the severity of flooding downstream." },
  { a: "delta", clue: "Which best explains why river deltas are both fertile and flood-prone at the same time?", rationale: "The same sediment deposits that make deltas fertile also raise flood risk, since the sediment builds a low, easily-flooded plain." },
  { a: "savanna", clue: "Which best explains the link between overgrazing and desertification in savanna regions?", rationale: "Removing too much grass cover exposes bare soil to erosion, gradually turning productive grassland into desert-like terrain." },
  { a: "peninsula", clue: "Which best explains why peninsulas face higher storm risk than inland areas?", rationale: "Water surrounding a peninsula on three sides gives storms more open water to build strength before making landfall." },
  { a: "archipelago", clue: "Which best explains why archipelagos are especially vulnerable to rising sea levels?", rationale: "Small islands with limited elevation have little buffer before rising water permanently submerges their land area." },
  { a: "frostpeak", clue: "Which best explains why steep terrain increases avalanche risk after heavy snowfall?", rationale: "Steep slopes make accumulated snow unstable, so added weight from new snowfall can trigger a sudden slide." },
  { a: "tundra", clue: "Which best explains why tundra ecosystems recover so slowly from disturbance?", rationale: "Extreme cold slows plant growth and decomposition dramatically, so damaged tundra vegetation takes far longer to regrow than in warmer climates." },
  { a: "peninsula", clue: "Which best explains why coastal erosion reshapes peninsula coastlines faster than inland landforms change?", rationale: "Constant wave action from multiple directions steadily wears away peninsula coastlines, unlike inland areas shielded from the sea." },
];

// Stage 5 — Evaluating: judge which region most needs a given policy or response
const POOL_PHYSICAL_EVALUATE = [
  { a: "archipelago", clue: "Which region would benefit most from investing in seawalls and long-term relocation planning to address sea-level rise?", rationale: "Low-lying island chains face the most direct, long-term threat from rising seas, making adaptive infrastructure and relocation planning most urgent there." },
  { a: "savanna", clue: "Which region would most benefit from strict grazing limits to prevent long-term land degradation?", rationale: "Limiting overgrazing protects the grass cover that prevents savanna soil from eroding into desert-like conditions." },
  { a: "tundra", clue: "Which region should prioritize permafrost monitoring as part of a national climate strategy?", rationale: "Since thawing permafrost can release major stores of greenhouse gases, monitoring it directly supports broader climate goals." },
  { a: "rainforest", clue: "Which region would gain the most from strict logging and land-use regulations to protect biodiversity?", rationale: "Its unmatched species density means that logging there causes disproportionately large biodiversity loss compared to other terrains." },
  { a: "frostpeak", clue: "Which region would benefit most from early-warning avalanche systems for mountain travelers?", rationale: "Steep slopes and heavy snow make avalanches a recurring hazard there, so early-warning systems directly reduce risk to life." },
  { a: "delta", clue: "Which region should prioritize flood-resistant infrastructure over other terrains, given its role as a farming region?", rationale: "Deltas combine high agricultural value with high flood risk, making flood-resistant infrastructure especially valuable there." },
  { a: "wetland", clue: "Which region would benefit most from wetland restoration projects aimed at natural flood control?", rationale: "Restoring wetland habitat directly strengthens its natural ability to absorb floodwater and protect surrounding areas." },
  { a: "desert", clue: "Which region would most justify investment in water-efficient irrigation technology?", rationale: "Extremely low rainfall makes every drop of water valuable, so efficient irrigation offers the greatest benefit there." },
  { a: "peninsula", clue: "Which region would benefit most from strict building codes addressing storm surge and cyclone damage?", rationale: "Exposure to water on three sides makes storm surge and cyclone damage a recurring risk that strict codes can reduce." },
  { a: "volcanic", clue: "Which region would benefit most from soil conservation programs following volcanic ash fertilization?", rationale: "Protecting and managing the newly fertile volcanic soil helps sustain its agricultural benefits over the long term." },
  { a: "highlands", clue: "Which region's terracing and slope-stabilization projects would most reduce landslide risk?", rationale: "Elevated, sloped terrain like a plateau's edge is most prone to landslides, so slope stabilization offers the greatest benefit there." },
  { a: "steppe", clue: "Which region would benefit most from a grassland restoration program to support both farming and grazing?", rationale: "Restoring degraded steppe grassland preserves the deep fertile soil that supports both grain farming and livestock grazing." },
  { a: "archipelago", clue: "Which region would benefit most from coral reef and mangrove protection to buffer coastal erosion?", rationale: "Reefs and mangroves naturally reduce wave energy around islands, helping to slow the coastal erosion archipelagos face." },
  { a: "wetland", clue: "Which region would benefit most from bird sanctuary designations along migratory routes?", rationale: "As critical rest stops for migratory birds, protecting these areas as sanctuaries directly supports migratory bird populations." },
  { a: "tundra", clue: "Which region should be prioritized for permafrost and ice-melt monitoring in climate research?", rationale: "Tundra environments are closely tied to permafrost and ice dynamics, making them key indicators for tracking climate-driven ice melt." },
];

// Stage 1 — Remembering: recall facts and definitions directly
const POOL_URBAN_REMEMBER = [
  { a: "cbd", clue: "Which district has the highest concentration of offices, banks, and skyscrapers?", rationale: "The Central Business District is defined by its concentration of corporate offices, financial institutions, and high-rise buildings." },
  { a: "civic", clue: "Which district houses the city hall, courts, and government offices?", rationale: "Civic districts are defined by their concentration of government and public administration buildings." },
  { a: "suburb", clue: "Which district is mostly made up of houses in a low-density neighborhood?", rationale: "Residential suburbs are defined by lower-density housing compared to the city center." },
  { a: "industrial", clue: "Which district is dominated by factories and manufacturing?", rationale: "Industrial zones are defined by concentrated manufacturing and production facilities." },
  { a: "campus", clue: "Which district has the highest concentration of schools, colleges, and student housing?", rationale: "Educational districts are defined by their density of academic institutions and student living spaces." },
  { a: "transit", clue: "Which district connects the most bus, rail, and transport lines?", rationale: "A transit hub is defined by being the convergence point for multiple transportation routes." },
  { a: "oldtown", clue: "Which district contains the city's oldest buildings and cultural heritage sites?", rationale: "Historic old towns are defined by preserving a city's oldest architecture and heritage sites." },
  { a: "greenbelt", clue: "Which district exists mainly to limit urban sprawl and preserve open space?", rationale: "A green belt is specifically designated to contain a city's growth and preserve undeveloped land." },
  { a: "entertainment", clue: "Which district has the highest concentration of theaters, bars, and nightlife venues?", rationale: "Entertainment districts are defined by their density of nightlife and leisure venues." },
  { a: "port", clue: "Which district handles most of the city's shipping and cargo?", rationale: "A port or waterfront district is defined by its role in handling maritime shipping and cargo." },
  { a: "informal", clue: "Which district grew without formal urban planning or land titles?", rationale: "Informal settlements are defined by their lack of official planning, zoning, or land ownership documentation." },
  { a: "periurban", clue: "Which district sits at the city's edge, where urban and rural land use mix?", rationale: "Peri-urban fringe areas are defined by this transition zone blending city and countryside land use." },
  { a: "cbd", clue: "Which district has the highest land value in the city?", rationale: "High demand for central, accessible commercial space makes land in the CBD the most expensive in the city." },
  { a: "suburb", clue: "Which district would have the most schools and parks per household?", rationale: "Suburbs are typically planned with more schools and parks to serve resident families, unlike dense commercial zones." },
  { a: "transit", clue: "Which district sees the highest foot traffic due to commuter transfers?", rationale: "As the convergence point for transport lines, transit hubs naturally see heavy pedestrian traffic from commuters transferring routes." },
];

// Stage 2 — Understanding: explain and interpret why these patterns happen
const POOL_URBAN_UNDERSTAND = [
  { a: "cbd", clue: "Why does the CBD experience the most traffic congestion during rush hour?", rationale: "As the city's main employment center, the CBD draws huge numbers of commuters in and out at the same times each day." },
  { a: "industrial", clue: "Why are industrial zones typically kept away from residential areas?", rationale: "Factories generate noise, pollution, and heavy traffic that are incompatible with peaceful residential living." },
  { a: "suburb", clue: "Why do suburban residents commonly commute daily into the city center?", rationale: "Suburbs offer more affordable housing but fewer jobs, so residents often travel to the city center for work." },
  { a: "campus", clue: "Why does a campus district's population swell during the school year and empty out on break?", rationale: "Its population is driven mainly by students, whose presence follows the academic calendar rather than year-round residency." },
  { a: "oldtown", clue: "Why do old town districts attract heritage tourism?", rationale: "Preserved historic architecture and cultural sites draw visitors interested in a city's history." },
  { a: "greenbelt", clue: "Why does a green belt help reduce a city's urban heat island effect?", rationale: "Vegetation and open space absorb less heat and provide cooling shade compared to dense pavement and buildings." },
  { a: "entertainment", clue: "Why is an entertainment district busiest at night rather than during the day?", rationale: "Its main venues — bars, clubs, and theaters — primarily operate and draw crowds during evening and nighttime hours." },
  { a: "port", clue: "Why does a port district's development depend heavily on harbor access?", rationale: "Its core function is shipping and trade, which requires direct access to navigable water." },
  { a: "informal", clue: "Why do informal settlements often lack reliable water and sanitation services?", rationale: "Since they grew without formal planning, they were never connected to the city's official utility infrastructure." },
  { a: "periurban", clue: "Why is peri-urban land often the first converted from farmland to housing as a city grows?", rationale: "Being at the city's edge, this land is the most accessible and least developed, making it the easiest to convert as demand for housing grows." },
  { a: "civic", clue: "Why does a civic district's architecture often look formal and imposing?", rationale: "Government buildings are often designed to project stability, authority, and permanence to the public." },
  { a: "transit", clue: "Why is a transit hub's location usually chosen based on accessibility rather than scenery or cost?", rationale: "A transit hub's core purpose is convenient connections, so being centrally accessible outweighs other site considerations." },
  { a: "entertainment", clue: "Why do entertainment districts often have contested noise regulations?", rationale: "Nightlife venues generate noise late into the night, which conflicts with nearby residents' need for quiet." },
  { a: "cbd", clue: "Why does the CBD typically have the highest land value in a city?", rationale: "High demand from businesses wanting central, accessible locations drives up land prices there more than anywhere else." },
  { a: "suburb", clue: "Why would a growing number of young families moving to a suburb increase demand for schools and parks there?", rationale: "As family-oriented residential areas, suburbs see demand for schools and parks rise directly with the number of resident families." },
];

// Stage 3 — Applying: identify the district from a concrete scenario
const POOL_URBAN_APPLY = [
  { a: "transit", clue: "A commuter switches from a bus to a train within the same building to continue their trip. Which district are they in?", rationale: "Seamlessly switching between transport modes in one location is the core function of a transit hub." },
  { a: "oldtown", clue: "A tourist photographs a centuries-old church and a cobblestone street lined with heritage houses. Which district is this?", rationale: "Centuries-old architecture and cobblestone streets are hallmarks of a historic old town." },
  { a: "suburb", clue: "A family looks for a quiet street with a backyard, close to an elementary school. Which district fits their needs?", rationale: "Quiet residential streets with houses and nearby schools are typical of a suburban neighborhood." },
  { a: "industrial", clue: "A factory worker complains about noise and smoke from nearby manufacturing plants. Which district do they work in?", rationale: "Noise and smoke from manufacturing are characteristic byproducts of an industrial zone." },
  { a: "campus", clue: "A group of students walks between their dormitory and a lecture hall a few blocks away. Which district is this?", rationale: "Dormitories and lecture halls within walking distance describe a college or educational campus district." },
  { a: "port", clue: "A shipping container is unloaded from a cargo vessel and placed onto a truck. Which district is this happening in?", rationale: "Loading and unloading cargo from ships is the defining activity of a port district." },
  { a: "entertainment", clue: "City officials debate a new noise ordinance after residents complain about bars operating past midnight. Which district does this concern?", rationale: "Late-night noise complaints tied to bars point directly to an entertainment district's nightlife venues." },
  { a: "informal", clue: "A family builds a home on unregistered land at the edge of the city, without connection to the water grid. Which district do they live in?", rationale: "Building without land registration or utility connections describes an informal settlement." },
  { a: "periurban", clue: "Developers submit a proposal to convert a stretch of farmland at the city's outer edge into new housing. Which district is this land in?", rationale: "Farmland being converted to housing at a city's outer edge is a defining process in the peri-urban fringe." },
  { a: "civic", clue: "A city council debates a new law inside a courthouse near the mayor's office. Which district is this?", rationale: "Courthouses and government offices clustered together define a civic district." },
  { a: "cbd", clue: "An office worker takes an elevator up a 40-story skyscraper to reach their bank's headquarters. Which district is this?", rationale: "High-rise office towers housing corporate and financial headquarters are characteristic of the Central Business District." },
  { a: "greenbelt", clue: "A jogger runs along a tree-lined path in a protected green space just outside the built-up part of the city. Which district is this?", rationale: "A protected green space bordering the developed city is the defining feature of a green belt." },
  { a: "campus", clue: "A student leaves for the summer, and their usual coffee shop reports a sharp drop in customers. Which district does this describe?", rationale: "A sharp seasonal drop in customers tied to students leaving matches an educational campus district's population pattern." },
  { a: "cbd", clue: "An urban planner proposes widening roads near the city's busiest office towers to ease evening gridlock. Which district does this affect?", rationale: "Rush hour gridlock near dense office towers is a defining traffic pattern of the Central Business District." },
  { a: "port", clue: "A dockworker tracks incoming container ships scheduled to unload throughout the week. Which district do they work in?", rationale: "Managing incoming container ships and cargo schedules is core port district work." },
];

// Stage 4 — Analyzing: break down causes, effects, and relationships
const POOL_URBAN_ANALYZE = [
  { a: "cbd", clue: "Which best explains why CBDs experience such intense rush hour congestion?", rationale: "A high concentration of jobs draws large numbers of commuters in and out at the same times each day, overwhelming road capacity." },
  { a: "informal", clue: "Which best explains the relationship between informal settlements and inadequate infrastructure?", rationale: "Because they developed outside formal planning processes, these areas were never connected to official utility and service networks." },
  { a: "campus", clue: "Which best explains why campus districts show strong seasonal population swings?", rationale: "Their population is driven by an academic calendar rather than permanent residency, so it rises and falls with the school year." },
  { a: "greenbelt", clue: "Which best explains the connection between a green belt and reduced urban heat?", rationale: "Vegetation absorbs and reflects less heat than pavement and buildings, so preserved green space cools surrounding areas." },
  { a: "entertainment", clue: "Which best explains why entertainment districts generate ongoing noise disputes?", rationale: "Nightlife businesses depend on operating late, which directly conflicts with nearby residents' expectations of nighttime quiet." },
  { a: "port", clue: "Which best explains why port districts tend to attract trade-related businesses nearby?", rationale: "Businesses that rely on importing or exporting goods benefit from locating close to shipping infrastructure to reduce transport costs." },
  { a: "periurban", clue: "Which best explains the link between peri-urban land conversion and a growing city population?", rationale: "As a city's population grows and central land runs out, developers look to the accessible, undeveloped land at the urban fringe." },
  { a: "civic", clue: "Which best explains why civic districts are often centrally located within a city?", rationale: "Placing government buildings centrally makes them equally accessible to residents and businesses throughout the city." },
  { a: "industrial", clue: "Which best explains why industrial zones are usually located near transport infrastructure?", rationale: "Manufacturing depends on moving raw materials in and finished goods out, which requires easy access to transport routes." },
  { a: "suburb", clue: "Which best explains why suburban growth increases commuter traffic into a city center?", rationale: "As more residents live in suburbs but work in the city center, their daily commute adds to traffic converging on that center." },
  { a: "oldtown", clue: "Which best explains why old towns are often protected from major redevelopment?", rationale: "Preserving historic buildings maintains cultural heritage and tourism value that redevelopment would destroy." },
  { a: "transit", clue: "Which best explains why transit hubs tend to attract nearby commercial development?", rationale: "High foot traffic from commuters passing through makes nearby locations attractive for shops and services." },
  { a: "informal", clue: "Which best explains why informal settlements often expand fastest during periods of rapid urban migration?", rationale: "When housing supply can't keep up with a surge of new arrivals, many end up settling informally on available land." },
  { a: "cbd", clue: "Which best explains why land prices can rise in the CBD while falling in peri-urban areas at the same time?", rationale: "Demand for accessible commercial space concentrates value in the CBD, while distance and lower demand keep peri-urban land comparatively cheap." },
  { a: "civic", clue: "Which best explains why entertainment and civic districts rarely overlap in city planning?", rationale: "Government districts prioritize quiet, orderly, formal environments, which conflicts with the noise and nightlife of entertainment areas." },
];

// Stage 5 — Evaluating: judge which district most needs a given policy or response
const POOL_URBAN_EVALUATE = [
  { a: "informal", clue: "Which district would benefit most from a formal land-titling and utility connection program?", rationale: "Providing legal land titles and utility access directly addresses the core disadvantages informal settlements face." },
  { a: "entertainment", clue: "Which district should be prioritized for noise-reduction zoning to balance nightlife and residential needs?", rationale: "Targeted zoning can separate late-night venues from housing, resolving the district's recurring noise conflicts." },
  { a: "cbd", clue: "Which district would benefit most from a light-rail extension to reduce daily congestion?", rationale: "Adding transit capacity directly targets the CBD's core problem of overwhelming commuter congestion." },
  { a: "oldtown", clue: "Which district should be protected by strict heritage preservation laws over new commercial development?", rationale: "Legal protection preserves irreplaceable historic value that would otherwise be lost to redevelopment pressure." },
  { a: "industrial", clue: "Which district would benefit most from stricter emissions standards for nearby factories?", rationale: "Tighter emissions standards directly address the pollution industrial zones are known to generate." },
  { a: "campus", clue: "Which district would benefit most from expanded student housing to ease nearby rental pressure?", rationale: "More on-campus housing reduces pressure on surrounding neighborhoods where students would otherwise compete for rentals." },
  { a: "greenbelt", clue: "Which district should local government prioritize for expanding green space to combat rising temperatures?", rationale: "Expanding protected green space most directly increases a city's capacity to cool itself and limit urban sprawl." },
  { a: "port", clue: "Which district would benefit most from investment in port modernization to remain competitive in trade?", rationale: "Since its core function is shipping and trade, modernizing port infrastructure directly supports the district's competitiveness." },
  { a: "periurban", clue: "Which district would benefit most from managed growth policies to prevent uncontrolled sprawl?", rationale: "As the zone where farmland converts to housing, managed growth policies there most directly control uncontrolled sprawl." },
  { a: "transit", clue: "Which district should be prioritized for accessible design upgrades, given how many commuters pass through it daily?", rationale: "As the busiest point for commuter transfers, accessibility upgrades there benefit the largest number of daily users." },
  { a: "suburb", clue: "Which district would benefit most from mixed-income housing policy to prevent it from becoming unaffordable?", rationale: "Without policy intervention, rising demand for suburban housing can price out lower-income families, so mixed-income policy helps preserve affordability." },
  { a: "civic", clue: "Which district would benefit most from centralizing public service offices to improve resident access?", rationale: "Consolidating government offices in the civic district makes public services easier for all residents to access in one place." },
  { a: "oldtown", clue: "Which district would benefit most from a public awareness campaign about historic preservation funding?", rationale: "Raising awareness of available preservation funding directly helps maintain the old town's historic buildings." },
  { a: "informal", clue: "Which district should be evaluated first when a city considers relocating residents to safer housing?", rationale: "Since informal settlements often lack safe infrastructure, they are the most urgent priority for relocation and housing evaluation." },
  { a: "transit", clue: "Which district would benefit most from a public plaza redesign to boost foot traffic for nearby small businesses?", rationale: "High existing foot traffic in a transit hub gives a redesigned plaza the greatest potential to boost nearby business visibility." },
];

/* ---------- Levels ---------- */
const BLOOM_STAGE_LABELS = ["Remembering", "Understanding", "Applying", "Analyzing", "Evaluating"];
const LEVELS = [
  {
    id: "l1", title: "Geography 1 (Human)", subtitle: "Population, migration, culture & society",
    map: null, pool: null, stageCount: 5, stageLabels: BLOOM_STAGE_LABELS,
    stagePools: [POOL_HUMAN_REMEMBER, POOL_HUMAN_UNDERSTAND, POOL_HUMAN_APPLY, POOL_HUMAN_ANALYZE, POOL_HUMAN_EVALUATE],
    badge: "Human Geographer", icon: Users, color: COLORS.rust,
  },
  {
    id: "l2", title: "Geography 2 (Physical)", subtitle: "Landforms, climate & physical processes",
    map: REGIONS, pool: null, stageCount: 5, stageLabels: BLOOM_STAGE_LABELS,
    stagePools: [POOL_PHYSICAL_REMEMBER, POOL_PHYSICAL_UNDERSTAND, POOL_PHYSICAL_APPLY, POOL_PHYSICAL_ANALYZE, POOL_PHYSICAL_EVALUATE],
    badge: "Physical Geographer", icon: MountainSnow, color: COLORS.moss,
  },
  {
    id: "l3", title: "Geography 3 (Urban)", subtitle: "City structure & urban planning",
    map: DISTRICTS, pool: null, stageCount: 5, stageLabels: BLOOM_STAGE_LABELS,
    stagePools: [POOL_URBAN_REMEMBER, POOL_URBAN_UNDERSTAND, POOL_URBAN_APPLY, POOL_URBAN_ANALYZE, POOL_URBAN_EVALUATE],
    badge: "Urban Planner", icon: Building2, color: COLORS.teal,
  },
];
function stageCountFor(level) { return level.stageCount || STAGE_COUNT; }
function poolFor(level, stageIdx) { return level.stagePools ? level.stagePools[stageIdx] : level.pool; }
const TOTAL_STAGES = LEVELS.reduce((sum, l) => sum + stageCountFor(l), 0);
const MASTER_BADGE = "GeoAdventure Graduate";
const ALL_BADGES = [...LEVELS.map((l) => l.badge), MASTER_BADGE];
const MANAGE_TARGETS = [...LEVELS];

/* ---------- Helpers ---------- */
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const CONTENT_COLORS = [COLORS.rust, COLORS.moss, COLORS.teal, COLORS.gold];
function withChoices(entry, mapItems) {
  if (entry.options) {
    // content-based question: options are authored directly on the question, not drawn from a shared board
    const order = shuffled(entry.options.map((_, i) => i));
    const choices = order.map((origIdx, pos) => ({ id: "opt" + origIdx, name: entry.options[origIdx], color: CONTENT_COLORS[pos % CONTENT_COLORS.length] }));
    return { clue: entry.clue, a: "opt" + entry.correct, choices, rationale: entry.rationale || "" };
  }
  const others = mapItems.filter((it) => it.id !== entry.a);
  const distractors = shuffled(others).slice(0, 3);
  const correctItem = mapItems.find((it) => it.id === entry.a);
  const choices = shuffled([correctItem, ...distractors]);
  return { clue: entry.clue, a: entry.a, choices, rationale: entry.rationale || "" };
}
function buildQuestionSet(pool, mapItems, count) {
  // never repeats a question within one set: capped at the pool's unique size
  const n = Math.min(count, pool.length);
  return shuffled(pool).slice(0, n).map((q) => withChoices(q, mapItems));
}
function starsFor(correct) {
  if (correct >= 18) return 3;
  if (correct >= 15) return 2;
  if (correct >= PASS_THRESHOLD) return 1;
  return 0;
}
function pointsPerQuestion(stageIdx) {
  return 2 + stageIdx;
}
const slugifyKey = (s) => (s || "").trim().toLowerCase().replace(/\s+/g, "");
const keyFor = (name) => "player:" + slugifyKey(name);
const teacherKeyFor = (codeKey) => "teacher:" + codeKey;
const teacherAccountKeyFor = (usernameKey) => "teacherAccount:" + usernameKey;
const rosterPrefixFor = (baseCodeKey, yearNum) => `roster:${baseCodeKey}:${yearNum}:`;
const rosterKeyFor = (baseCodeKey, yearNum, name) => rosterPrefixFor(baseCodeKey, yearNum) + slugifyKey(name);
const normalizeCode = (code) => slugifyKey(code);
const STUDENT_PREFIX = "GEOAD_";
function fullStudentUsername(input) {
  let v = (input || "").trim();
  if (!v) return "";
  if (v.toLowerCase().startsWith(STUDENT_PREFIX.toLowerCase())) v = v.slice(STUDENT_PREFIX.length);
  return STUDENT_PREFIX + v;
}
const YEAR_NUMS = ["1", "2", "3", "4"];
const YEAR_LABELS = { "1": "1st Year", "2": "2nd Year", "3": "3rd Year", "4": "4th Year" };
function parseJoinCode(raw) {
  const trimmed = (raw || "").trim();
  const m = trimmed.match(/^(.+)-([1-4])$/);
  if (!m) return null;
  const base = normalizeCode(m[1]);
  if (!base) return null;
  return { base, yearNum: m[2] };
}
function questionsKeyFor(levelId, stageIdx, hasStagePools) {
  return hasStagePools ? `questions:${levelId}:stage${stageIdx}` : `questions:${levelId}:all`;
}
function defaultEditablePool(target, stageIdx) {
  const raw = target.stagePools ? target.stagePools[stageIdx] : target.pool;
  return raw.map((q) => {
    if (q.options) return { clue: q.clue, options: [...q.options], correct: q.correct, rationale: q.rationale || "" };
    const correctItem = target.map.find((it) => it.id === q.a);
    const others = shuffled(target.map.filter((it) => it.id !== q.a)).slice(0, 3);
    const opts = shuffled([correctItem, ...others]);
    return { clue: q.clue, options: opts.map((o) => o.name), correct: opts.findIndex((o) => o.id === q.a), rationale: q.rationale || "" };
  });
}
function emptyProgress(level) {
  const n = stageCountFor(level);
  return { stagesCompleted: Array(n).fill(false), stagesStars: Array(n).fill(0) };
}
function emptyProfile(name, password) {
  const progress = {};
  for (const l of LEVELS) progress[l.id] = emptyProgress(l);
  return { name: name.trim(), password: password || "", points: 0, badges: [], avatar: null, teacherCode: null, yearNum: null, personalInfo: null, progress };
}
function normalizeProfile(p, name) {
  if (!p || typeof p !== "object") return emptyProfile(name);
  const fixed = { name: p.name || name, password: p.password || "", points: p.points || 0, badges: Array.isArray(p.badges) ? p.badges : [], avatar: p.avatar || null, teacherCode: p.teacherCode || null, yearNum: YEAR_NUMS.includes(p.yearNum) ? p.yearNum : null, personalInfo: p.personalInfo && p.personalInfo.surname ? p.personalInfo : null, progress: {} };
  for (const l of LEVELS) {
    const n = stageCountFor(l);
    const stored = p.progress?.[l.id];
    const sameSize = stored && Array.isArray(stored.stagesCompleted) && stored.stagesCompleted.length === n;
    fixed.progress[l.id] = sameSize ? stored : emptyProgress(l);
  }
  return fixed;
}
function fullNameOf(profile) {
  const pi = profile?.personalInfo;
  if (!pi || !pi.surname) return profile?.name || "";
  const mi = pi.middleInitial ? pi.middleInitial.trim().replace(/\.+$/, "") + "." : "";
  return [`${pi.surname}, ${pi.firstName}`, mi, pi.suffix].filter(Boolean).join(" ").trim();
}
function destinationAfterLogin(profile) {
  if (!profile.teacherCode) return "joinClass";
  if (!profile.personalInfo) return "personalInfo";
  if (!profile.avatar) return "avatarSelect";
  return "levelSelect";
}
function levelUnlocked(player, levelIdx) {
  if (levelIdx === 0) return true;
  const prev = LEVELS[levelIdx - 1];
  return player.progress[prev.id].stagesCompleted.every(Boolean);
}
function stageUnlocked(player, levelId, stageIdx) {
  if (stageIdx === 0) return true;
  return player.progress[levelId].stagesCompleted[stageIdx - 1];
}

/* ---------- Small UI atoms ---------- */
function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm" style={{ background: COLORS.parchmentDeep, color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif" }}>
      {children}
    </span>
  );
}
function StarRow({ count, size = 16 }) {
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <Star key={i} size={size} style={{ color: COLORS.gold, fill: i < count ? COLORS.gold : "none" }} />
      ))}
    </span>
  );
}
function TopBar({ player, onBadges, onLeaderboard, onLogout, onHome, active }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4" style={{ background: COLORS.ink, color: COLORS.parchment }}>
      <button className="flex items-center gap-2" onClick={onHome}>
        <Compass size={22} style={{ color: COLORS.gold }} />
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600 }}>GeoAdventure</span>
      </button>
      {player && (
        <div className="flex flex-wrap items-center gap-2">
          <Pill>{player.avatar ? <Avatar id={player.avatar} size={18} /> : <User size={14} />} {player.name}</Pill>
          <Pill><Star size={14} style={{ color: COLORS.gold }} /> {player.points} pts</Pill>
          <Pill><Award size={14} style={{ color: COLORS.moss }} /> {player.badges.length} badges</Pill>
          <button onClick={onHome} className="px-3 py-1 rounded-full text-sm flex items-center gap-1" style={{ background: active === "levelSelect" ? COLORS.gold : "transparent", border: `1px solid ${COLORS.gold}`, color: active === "levelSelect" ? COLORS.ink : COLORS.gold, fontFamily: "'Space Grotesk', sans-serif" }}><Home size={13} /> Home</button>
          <button onClick={onBadges} className="px-3 py-1 rounded-full text-sm" style={{ background: active === "badges" ? COLORS.gold : "transparent", border: `1px solid ${COLORS.gold}`, color: active === "badges" ? COLORS.ink : COLORS.gold, fontFamily: "'Space Grotesk', sans-serif" }}>Badges</button>
          <button onClick={onLeaderboard} className="px-3 py-1 rounded-full text-sm" style={{ background: active === "leaderboard" ? COLORS.gold : "transparent", border: `1px solid ${COLORS.gold}`, color: active === "leaderboard" ? COLORS.ink : COLORS.gold, fontFamily: "'Space Grotesk', sans-serif" }}>Leaderboard</button>
          <button onClick={onLogout} className="p-2 rounded-full hover:opacity-80" title="Switch player"><LogOut size={16} /></button>
        </div>
      )}
    </div>
  );
}

/* ---------- Login ---------- */
function LoginScreen({ onStudentLogin, onTeacherLogin, loading, errorMsg }) {
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function submit() {
    if (!username.trim() || !password) return;
    if (role === "student") onStudentLogin(username, password);
    else onTeacherLogin(username, password);
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6" style={{ background: `radial-gradient(circle at 30% 20%, ${COLORS.inkSoft}, ${COLORS.ink})` }}>
      <div className="w-full max-w-md rounded-2xl p-8" style={{ background: COLORS.parchment }}>
        <div className="flex items-center gap-2 mb-1">
          <Compass size={26} style={{ color: COLORS.rust }} />
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, color: COLORS.ink, fontWeight: 600 }}>GeoAdventure</h1>
        </div>

        <div className="flex gap-2 mb-5 mt-4">
          {["student", "teacher"].map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setUsername(""); setPassword(""); }}
              className="flex-1 py-2 rounded-lg text-sm font-medium capitalize"
              style={{
                background: role === r ? COLORS.gold : COLORS.parchmentDeep,
                color: role === r ? COLORS.ink : COLORS.ink70,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {role === "student" ? (
          <p className="mb-5" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, lineHeight: 1.5 }}>
            Choose a username and password the first time — after that, sign in the same way and you'll skip
            straight past the class code and personal info.
          </p>
        ) : (
          <p className="mb-5" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, lineHeight: 1.5 }}>
            Choose a username and password the first time to set up your class. After that, sign in the same way
            to open your dashboard directly.
          </p>
        )}

        <label className="block text-sm mb-1" style={{ color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif" }}>Username</label>
        {role === "student" ? (
          <div className="flex items-stretch mb-3">
            <span className="px-3 py-2.5 rounded-l-lg text-sm flex items-center" style={{ background: COLORS.parchmentDeep, color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif", border: `1.5px solid ${COLORS.parchmentDeep}`, borderRight: "none" }}>{STUDENT_PREFIX}</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Jozel" className="flex-1 px-3 py-2.5 rounded-r-lg outline-none" style={{ border: `1.5px solid ${COLORS.parchmentDeep}`, background: "white", color: COLORS.ink }} />
          </div>
        ) : (
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. eliza.jacinto" className="w-full px-4 py-2.5 rounded-lg mb-3 outline-none" style={{ border: `1.5px solid ${COLORS.parchmentDeep}`, background: "white", color: COLORS.ink }} />
        )}

        <label className="block text-sm mb-1" style={{ color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif" }}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg mb-3 outline-none" style={{ border: `1.5px solid ${COLORS.parchmentDeep}`, background: "white", color: COLORS.ink }} />

        {errorMsg && <p className="text-sm mb-3" style={{ color: COLORS.rust }}>{errorMsg}</p>}
        <button disabled={!username.trim() || !password || loading} onClick={submit} className="w-full py-2.5 rounded-lg font-medium disabled:opacity-50" style={{ background: COLORS.gold, color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
          {loading ? "Checking the field log…" : "Continue"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Join class: shown right after a student enters their name ---------- */
function JoinClassScreen({ name, onJoin, onBack, loading, errorMsg }) {
  const [code, setCode] = useState("");
  const canSubmit = code.trim() && !loading;
  const displayName = name.trim().toLowerCase().startsWith(STUDENT_PREFIX.toLowerCase()) ? name.trim().slice(STUDENT_PREFIX.length) : name.trim();
  return (
    <div className="flex-1 flex items-center justify-center p-6" style={{ background: `radial-gradient(circle at 30% 20%, ${COLORS.inkSoft}, ${COLORS.ink})` }}>
      <div className="w-full max-w-md rounded-2xl p-8" style={{ background: COLORS.parchment }}>
        <button onClick={onBack} className="flex items-center gap-1 mb-3 text-sm" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}><ArrowLeft size={16} /> Back</button>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: COLORS.ink, marginBottom: 6 }}>Hi, {displayName} 👋</h1>
        <p className="mb-5" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, lineHeight: 1.5 }}>
          Enter your teacher's class code with your year level added at the end — <strong>-1</strong> for 1st year,{" "}
          <strong>-2</strong> for 2nd, <strong>-3</strong> for 3rd, or <strong>-4</strong> for 4th.
        </p>

        <label className="block text-sm mb-1" style={{ color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif" }}>Class code</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && canSubmit && onJoin(code)} placeholder="e.g. HUMGEO-2" className="w-full px-4 py-2.5 rounded-lg mb-4 outline-none" style={{ border: `1.5px solid ${COLORS.parchmentDeep}`, background: "white", color: COLORS.ink }} />

        {errorMsg && <p className="text-sm mb-3" style={{ color: COLORS.rust }}>{errorMsg}</p>}
        <button disabled={!canSubmit} onClick={() => onJoin(code)} className="w-full py-2.5 rounded-lg font-medium disabled:opacity-50" style={{ background: COLORS.gold, color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
          {loading ? "Joining…" : "Join class"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Teacher one-time setup: shown right after a new teacher account is created ---------- */
function TeacherSetupScreen({ onSubmit, onBack, loading, errorMsg }) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [code, setCode] = useState("");
  const canSubmit = name.trim() && department && code.trim() && !loading;

  return (
    <div className="flex-1 flex items-center justify-center p-6" style={{ background: `radial-gradient(circle at 30% 20%, ${COLORS.inkSoft}, ${COLORS.ink})` }}>
      <div className="w-full max-w-md rounded-2xl p-8" style={{ background: COLORS.parchment }}>
        <button onClick={onBack} className="flex items-center gap-1 mb-3 text-sm" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}><ArrowLeft size={16} /> Back</button>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, color: COLORS.ink, marginBottom: 6 }}>Set up your class</h1>
        <p className="mb-5" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, lineHeight: 1.5 }}>
          This appears once. Next time you sign in with this username and password, your dashboard opens directly.
        </p>

        <label className="block text-sm mb-1" style={{ color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif" }}>Your name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Eliza Jacinto" className="w-full px-4 py-2.5 rounded-lg mb-3 outline-none" style={{ border: `1.5px solid ${COLORS.parchmentDeep}`, background: "white", color: COLORS.ink }} />

        <label className="block text-sm mb-1" style={{ color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif" }}>Department</label>
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-4 py-2.5 rounded-lg mb-3 outline-none" style={{ border: `1.5px solid ${COLORS.parchmentDeep}`, background: "white", color: COLORS.ink }}>
          <option value="">Select department</option>
          <option value="Basic Education Department">Basic Education Department</option>
          <option value="College Department">College Department</option>
        </select>

        <label className="block text-sm mb-1" style={{ color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif" }}>Permanent class code (share this base code — students add their own -1/-2/-3/-4)</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && canSubmit && onSubmit(name, department, code)} placeholder="e.g. HUMGEO" className="w-full px-4 py-2.5 rounded-lg mb-3 outline-none" style={{ border: `1.5px solid ${COLORS.parchmentDeep}`, background: "white", color: COLORS.ink }} />

        {errorMsg && <p className="text-sm mb-3" style={{ color: COLORS.rust }}>{errorMsg}</p>}
        <button disabled={!canSubmit} onClick={() => onSubmit(name, department, code)} className="w-full py-2.5 rounded-lg font-medium disabled:opacity-50" style={{ background: COLORS.gold, color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
          {loading ? "Setting up…" : "Open teacher dashboard"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Personal information: required before a student can access stages ---------- */
function PersonalInfoScreen({ onSubmit }) {
  const [surname, setSurname] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [suffix, setSuffix] = useState("");
  const [course, setCourse] = useState("");
  const [yearBlock, setYearBlock] = useState("");

  const canSubmit = surname.trim() && firstName.trim() && course.trim() && yearBlock.trim();

  function submit() {
    if (!canSubmit) return;
    onSubmit({
      surname: surname.trim(),
      firstName: firstName.trim(),
      middleInitial: middleInitial.trim(),
      suffix: suffix.trim(),
      course: course.trim(),
      yearBlock: yearBlock.trim(),
    });
  }

  const inputStyle = { border: `1.5px solid ${COLORS.parchmentDeep}`, background: "white", color: COLORS.ink };

  return (
    <div className="flex-1 flex items-center justify-center p-6" style={{ background: `radial-gradient(circle at 30% 20%, ${COLORS.inkSoft}, ${COLORS.ink})` }}>
      <div className="w-full max-w-lg rounded-2xl p-8" style={{ background: COLORS.parchment }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, color: COLORS.ink, marginBottom: 6 }}>Tell us about yourself</h1>
        <p className="mb-5" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, lineHeight: 1.5 }}>
          Your teacher needs this to match your progress to your record. This appears once — you won't need to fill it out again.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm mb-1" style={{ color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif" }}>Surname</label>
            <input value={surname} onChange={(e) => setSurname(e.target.value)} className="w-full px-3 py-2 rounded-lg outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif" }}>First Name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 rounded-lg outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif" }}>Middle Initial</label>
            <input value={middleInitial} onChange={(e) => setMiddleInitial(e.target.value)} placeholder="e.g. P" maxLength={3} className="w-full px-3 py-2 rounded-lg outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif" }}>Suffix (optional)</label>
            <input value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="e.g. Jr., III" className="w-full px-3 py-2 rounded-lg outline-none" style={inputStyle} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-sm mb-1" style={{ color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif" }}>Course / Strand</label>
            <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. STEM, BS CS" className="w-full px-3 py-2 rounded-lg outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif" }}>Year & Block</label>
            <input value={yearBlock} onChange={(e) => setYearBlock(e.target.value)} placeholder="e.g. Grade 12 - STEM A" className="w-full px-3 py-2 rounded-lg outline-none" style={inputStyle} />
          </div>
        </div>

        <button disabled={!canSubmit} onClick={submit} className="w-full py-2.5 rounded-lg font-medium disabled:opacity-50" style={{ background: COLORS.gold, color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
          Continue
        </button>
      </div>
    </div>
  );
}

/* ---------- Student avatars: equal boy/girl options, student-styled ---------- */
const AVATARS = [
  { id: "b1", gender: "boy", bg: "#C99A3B", skin: "#E8B98A", hair: "#3B2A20" },
  { id: "b2", gender: "boy", bg: "#2F5D62", skin: "#8C5A3B", hair: "#141414" },
  { id: "b3", gender: "boy", bg: "#5C7A5C", skin: "#F2C9A0", hair: "#6B4A2B" },
  { id: "b4", gender: "boy", bg: "#B5563C", skin: "#3E2A1F", hair: "#0D0D0D" },
  { id: "g1", gender: "girl", bg: "#C99A3B", skin: "#F2C9A0", hair: "#3B2A20" },
  { id: "g2", gender: "girl", bg: "#2F5D62", skin: "#8C5A3B", hair: "#141414" },
  { id: "g3", gender: "girl", bg: "#5C7A5C", skin: "#E8B98A", hair: "#8A4B2B" },
  { id: "g4", gender: "girl", bg: "#B5563C", skin: "#3E2A1F", hair: "#2B1A10" },
];
function Avatar({ id, size = 40 }) {
  const a = AVATARS.find((x) => x.id === id) || AVATARS[0];
  const isGirl = a.gender === "girl";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ flexShrink: 0, borderRadius: "9999px" }}>
      <circle cx="32" cy="32" r="32" fill={a.bg} />
      {isGirl && <path d="M14,34 Q32,6 50,34 L47,44 Q32,14 17,44 Z" fill={a.hair} />}
      {isGirl && <path d="M45,36 Q54,40 49,52 L43,47 Z" fill={a.hair} />}
      <circle cx="32" cy="38" r="13" fill={a.skin} />
      {!isGirl && <path d="M18,32 Q32,12 46,32 L44,24 Q32,16 20,24 Z" fill={a.hair} />}
      <circle cx="27" cy="38" r="1.6" fill="#2A2118" />
      <circle cx="37" cy="38" r="1.6" fill="#2A2118" />
      <path d="M27,45 Q32,48 37,45" stroke="#2A2118" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <g transform="translate(38,42)">
        <rect x="0" y="4" width="15" height="9" rx="2" fill="white" />
        <path d="M7.5,0 L15,4.5 L7.5,9 L0,4.5 Z" fill={COLORS.ink} />
      </g>
    </svg>
  );
}
function AvatarSelectScreen({ name, onChoose }) {
  const [picked, setPicked] = useState(null);
  return (
    <div className="flex-1 flex items-center justify-center p-6" style={{ background: `radial-gradient(circle at 30% 20%, ${COLORS.inkSoft}, ${COLORS.ink})` }}>
      <div className="w-full max-w-lg rounded-2xl p-8" style={{ background: COLORS.parchment }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: COLORS.ink, marginBottom: 6 }}>Pick your avatar, {name.trim()}</h1>
        <p className="mb-5" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, lineHeight: 1.5 }}>
          This is how you'll show up on the leaderboard and your teacher's class roster.
        </p>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {AVATARS.map((a) => (
            <button
              key={a.id}
              onClick={() => setPicked(a.id)}
              className="rounded-full p-1 flex items-center justify-center"
              style={{ border: `3px solid ${picked === a.id ? COLORS.gold : "transparent"}` }}
            >
              <Avatar id={a.id} size={64} />
            </button>
          ))}
        </div>
        <button disabled={!picked} onClick={() => onChoose(picked)} className="w-full py-2.5 rounded-lg font-medium disabled:opacity-50" style={{ background: COLORS.gold, color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
          Continue
        </button>
      </div>
    </div>
  );
}

/* ---------- Level select ---------- */
function LevelSelectScreen({ player, onOpenLevel }) {
  return (
    <div className="flex-1 p-5 sm:p-8 max-w-4xl mx-auto w-full">
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: COLORS.ink }}>Choose a subject</h2>
      <p className="mb-5" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>
        Clear each stage's 20 questions with at least {PASS_THRESHOLD}/20 correct to unlock the next — fall short and the questions reshuffle for your retry.
      </p>
      <div className="grid sm:grid-cols-3 gap-4">
        {LEVELS.map((level, i) => {
          const unlocked = levelUnlocked(player, i);
          const total = stageCountFor(level);
          const done = player.progress[level.id].stagesCompleted.filter(Boolean).length;
          const Icon = level.icon;
          return (
            <button key={level.id} disabled={!unlocked} onClick={() => onOpenLevel(i)} className="text-left rounded-2xl p-5 transition-transform disabled:opacity-55" style={{ background: COLORS.parchmentDeep, border: `2px solid ${unlocked ? level.color : "#B9B0A0"}` }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center mb-3" style={{ background: unlocked ? level.color : "#B9B0A0" }}>
                {unlocked ? <Icon size={20} color="white" /> : <Lock size={18} color="white" />}
              </div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: COLORS.ink, marginBottom: 3 }}>{level.title}</h3>
              <p className="text-sm mb-3" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>{level.subtitle}</p>
              <div className="w-full h-2 rounded-full" style={{ background: "#DCD3BC" }}>
                <div className="h-2 rounded-full" style={{ width: `${(done / total) * 100}%`, background: level.color }} />
              </div>
              <span className="text-xs" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>{done}/{total} stages</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Stage select ---------- */
function StageSelectScreen({ level, player, onBack, onOpenStage }) {
  const prog = player.progress[level.id];
  const total = stageCountFor(level);
  return (
    <div className="flex-1 p-5 sm:p-8 max-w-3xl mx-auto w-full">
      <button onClick={onBack} className="flex items-center gap-1 mb-3 text-sm" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}><ArrowLeft size={16} /> All subjects</button>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: COLORS.ink }}>{level.title}</h2>
      <p className="mb-5" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>{level.subtitle}</p>
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: total }).map((_, i) => {
          const unlocked = stageUnlocked(player, level.id, i);
          const done = prog.stagesCompleted[i];
          const stars = prog.stagesStars[i];
          return (
            <button key={i} disabled={!unlocked} onClick={() => onOpenStage(i)} className="rounded-xl p-3 flex flex-col items-center disabled:opacity-50" style={{ background: done ? level.color : unlocked ? COLORS.parchmentDeep : "#EDEAE2" }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: done ? "white" : COLORS.ink }}>{unlocked ? i + 1 : <Lock size={16} />}</span>
              {level.stageLabels && unlocked && (
                <span className="text-[9px] mt-0.5 text-center leading-tight" style={{ color: done ? "white" : COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>{level.stageLabels[i]}</span>
              )}
              {unlocked && <StarRow count={stars} size={11} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Answer options: 4-choice multiple choice (shared by stage play) ---------- */
function AnswerOptions({ options, correctId, selected, feedback, onPick }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {options.map((opt, i) => {
        const Icon = opt.icon;
        const isSelected = selected === opt.id;
        const showResult = feedback && isSelected;
        const revealCorrect = feedback === "wrong" && opt.id === correctId;
        const solid = showResult ? (feedback === "correct" ? COLORS.moss : COLORS.rust) : revealCorrect ? COLORS.moss : null;
        return (
          <button
            key={opt.id}
            onClick={() => onPick(opt.id)}
            disabled={!!feedback}
            className="flex items-center gap-3 p-3.5 rounded-xl text-left transition-colors"
            style={{
              background: solid || COLORS.parchmentDeep,
              border: `2px solid ${solid || "transparent"}`,
              opacity: feedback && !isSelected && !revealCorrect ? 0.6 : 1,
            }}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: opt.color }}>
              {Icon ? <Icon size={16} color="white" /> : <span style={{ color: "white", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14 }}>{String.fromCharCode(65 + i)}</span>}
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, color: solid ? "white" : COLORS.ink }}>{opt.name}</span>
            {showResult && <span className="ml-auto">{feedback === "correct" ? <Check size={18} color="white" /> : <X size={18} color="white" />}</span>}
            {revealCorrect && <span className="ml-auto"><Check size={18} color="white" /></span>}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Stage play ---------- */
function StageScreen({ level, stageIdx, attempt, onExit, onFinish }) {
  const [rawPool, setRawPool] = useState(null); // null = loading
  useEffect(() => {
    let cancelled = false;
    setRawPool(null);
    (async () => {
      const key = questionsKeyFor(level.id, stageIdx, !!level.stagePools);
      let override = null;
      try {
        const res = await window.storage.get(key, true);
        if (res) override = JSON.parse(res.value);
      } catch {}
      if (!cancelled) setRawPool(override && override.length ? override : poolFor(level, stageIdx));
    })();
    return () => { cancelled = true; };
  }, [level, stageIdx, attempt]);

  // attempt is part of the dependency array so every retry — pass or fail — draws a fresh, non-repeating set
  const questions = useMemo(() => (rawPool ? buildQuestionSet(rawPool, level.map, QUESTIONS_PER_STAGE) : []), [rawPool, level, stageIdx, attempt]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    setQIdx(0); setSelected(null); setFeedback(null); setCorrectCount(0);
  }, [attempt, stageIdx, level]);

  if (!rawPool || questions.length === 0) {
    return (
      <div className="flex-1 p-5 sm:p-8 max-w-4xl mx-auto w-full">
        <p style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>Loading questions…</p>
      </div>
    );
  }

  const total = questions.length;
  const q = questions[qIdx];
  const ppq = pointsPerQuestion(stageIdx);

  function handlePick(regionId) {
    if (feedback) return;
    setSelected(regionId);
    const correct = regionId === q.a;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setCorrectCount((c) => c + 1);
  }

  function advance() {
    if (qIdx + 1 < total) {
      setQIdx((v) => v + 1);
      setSelected(null);
      setFeedback(null);
    } else {
      onFinish(correctCount, correctCount * ppq);
    }
  }

  return (
    <div className="flex-1 p-5 sm:p-8 max-w-4xl mx-auto w-full">
      <button onClick={onExit} className="flex items-center gap-1 mb-3 text-sm" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}><ArrowLeft size={16} /> Stage select</button>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: COLORS.ink }}>
          {level.title} · Stage {stageIdx + 1}{level.stageLabels ? ` · ${level.stageLabels[stageIdx]}` : ""}
        </h2>
        <Pill>{ppq} pts / correct</Pill>
      </div>
      <p className="mb-3 text-sm" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>Question {qIdx + 1} of {total} · {correctCount} correct so far</p>
      <div className="w-full h-1.5 rounded-full mb-4" style={{ background: "#DCD3BC" }}>
        <div className="h-1.5 rounded-full" style={{ width: `${(qIdx / total) * 100}%`, background: level.color }} />
      </div>
      <div className="rounded-xl p-4 mb-4" style={{ background: COLORS.ink, color: COLORS.parchment }}>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, lineHeight: 1.5 }}>{q.clue}</p>
      </div>
      <AnswerOptions options={q.choices} correctId={q.a} selected={selected} feedback={feedback} onPick={handlePick} />

      {feedback && (
        <div className="mt-4 rounded-xl p-4" style={{ background: feedback === "correct" ? "#E3ECE1" : "#F3E3DE", border: `1.5px solid ${feedback === "correct" ? COLORS.moss : COLORS.rust}` }}>
          <p className="flex items-center gap-2 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: feedback === "correct" ? COLORS.moss : COLORS.rust }}>
            {feedback === "correct" ? <Check size={16} /> : <X size={16} />}
            {feedback === "correct" ? "Correct" : "Not quite"}
          </p>
          {q.rationale && <p style={{ color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, lineHeight: 1.5 }}>{q.rationale}</p>}
          <button onClick={advance} className="mt-3 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: COLORS.gold, color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
            {qIdx + 1 < total ? "Next question" : "See results"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Stage complete ---------- */
function StageCompleteScreen({ level, stageIdx, correct, earned, passed, levelJustCompleted, onRetry, onContinue }) {
  const [showSticker, setShowSticker] = useState(passed);
  const [stickerIn, setStickerIn] = useState(false);
  useEffect(() => {
    if (!passed) return;
    const raf = requestAnimationFrame(() => setStickerIn(true));
    const t = setTimeout(() => setShowSticker(false), 2000);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, [passed]);

  return (
    <div className="flex-1 flex items-center justify-center p-6" style={{ position: "relative" }}>
      {showSticker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(27,42,56,0.5)", opacity: stickerIn ? 1 : 0, transition: "opacity 0.25s" }}
        >
          <div
            style={{
              background: COLORS.gold, width: 170, height: 170, borderRadius: "50%",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              border: "5px solid white", boxShadow: "0 14px 32px rgba(0,0,0,0.35)",
              transform: stickerIn ? "scale(1) rotate(-6deg)" : "scale(0.4) rotate(-6deg)",
              transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <Sparkles size={34} color={COLORS.ink} />
            <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 17, color: COLORS.ink, marginTop: 6 }}>Great job!</p>
          </div>
        </div>
      )}
      <div className="max-w-md w-full rounded-2xl p-8 text-center" style={{ background: COLORS.parchment }}>
        {passed ? <Trophy size={40} style={{ color: COLORS.gold, margin: "0 auto 12px" }} /> : <Sparkles size={36} style={{ color: COLORS.rust, margin: "0 auto 12px" }} />}
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, color: COLORS.ink, marginBottom: 6 }}>{passed ? `Stage ${stageIdx + 1} cleared` : `Stage ${stageIdx + 1}: not quite`}</h2>
        <p style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 10 }}>
          You scored <strong>{correct}/{QUESTIONS_PER_STAGE}</strong> and earned <strong>{earned} points</strong>.
        </p>
        <div className="flex justify-center mb-4"><StarRow count={starsFor(correct)} size={26} /></div>
        {!passed && (
          <p className="mb-4 text-sm" style={{ color: COLORS.rust, fontFamily: "'Space Grotesk', sans-serif" }}>
            You need at least {PASS_THRESHOLD}/20 correct to unlock the next stage. A new set of questions is ready for your next attempt.
          </p>
        )}
        {passed && levelJustCompleted && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: COLORS.moss, color: "white" }}><Medal size={18} /> {level.badge} unlocked</div>
        )}
        <div className="flex gap-3">
          <button onClick={onRetry} className="flex-1 py-2.5 rounded-lg font-medium" style={{ background: "white", border: `1.5px solid ${COLORS.ink70}`, color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>{passed ? "Play again" : "Retry with new questions"}</button>
          <button onClick={onContinue} className="flex-1 py-2.5 rounded-lg font-medium" style={{ background: COLORS.gold, color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>Continue</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Badges ---------- */
function BadgesScreen({ player }) {
  return (
    <div className="flex-1 p-5 sm:p-8 max-w-3xl mx-auto w-full">
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: COLORS.ink }}>Field badges</h2>
      <p className="mb-5" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>{player.badges.length} of {ALL_BADGES.length} earned</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {ALL_BADGES.map((b) => {
          const earned = player.badges.includes(b);
          return (
            <div key={b} className="rounded-xl p-4 flex flex-col items-center text-center" style={{ background: earned ? COLORS.parchmentDeep : "#EDEAE2", opacity: earned ? 1 : 0.6 }}>
              {earned ? <Medal size={26} style={{ color: COLORS.gold }} /> : <Lock size={22} style={{ color: "#9A9284" }} />}
              <span className="mt-2 text-sm" style={{ color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}>{b}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Leaderboard ---------- */
function LeaderboardScreen({ rows, loading, currentName }) {
  return (
    <div className="flex-1 p-5 sm:p-8 max-w-2xl mx-auto w-full">
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: COLORS.ink }}>Leaderboard</h2>
      <p className="mb-5 flex items-center gap-1" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}><Users size={15} /> Everyone in your class</p>
      {loading ? (
        <p style={{ color: COLORS.ink70 }}>Reading the field log…</p>
      ) : rows.length === 0 ? (
        <p style={{ color: COLORS.ink70 }}>No explorers yet — be the first to clear a stage.</p>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: COLORS.parchment }}>
          {rows.map((r, i) => {
            const stagesDone = LEVELS.reduce((sum, l) => sum + (r.progress?.[l.id]?.stagesCompleted?.filter(Boolean).length || 0), 0);
            const isSelf = r.name.toLowerCase() === currentName;
            return (
              <div key={r.name} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < rows.length - 1 ? `1px solid ${COLORS.parchmentDeep}` : "none", background: isSelf ? COLORS.parchmentDeep : "transparent" }}>
                <div className="flex items-center gap-3">
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: COLORS.ink, width: 20 }}>{i + 1}</span>
                  {r.avatar && <Avatar id={r.avatar} size={22} />}
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.ink }}>{r.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>
                  <span>{isSelf ? `${stagesDone}/${TOTAL_STAGES} stages` : "•••• stages"}</span>
                  <Pill><Star size={13} style={{ color: COLORS.gold }} /> {isSelf ? r.points : "••••"}</Pill>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Teacher dashboard ---------- */
function YearColumn({ label, students, sortBy, onRemoveStudent }) {
  const sorted = [...students].sort((a, b) => {
    if (sortBy === "name") return fullNameOf(a).localeCompare(fullNameOf(b));
    return b.points - a.points;
  });
  return (
    <div className="rounded-xl flex flex-col" style={{ background: COLORS.parchmentDeep, minHeight: 200 }}>
      <div className="px-3 py-2.5 rounded-t-xl flex items-center justify-between" style={{ background: COLORS.ink, color: COLORS.parchment }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>{label}</span>
        <Pill>{students.length}</Pill>
      </div>
      <div className="p-2 flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 520 }}>
        {sorted.length === 0 ? (
          <p className="text-xs p-2" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>No students yet.</p>
        ) : (
          sorted.map((p, i) => (
            <div key={p.name + i} className="rounded-lg p-2.5" style={{ background: "white" }}>
              <div className="flex items-center gap-2 mb-1.5">
                {p.avatar && <Avatar id={p.avatar} size={22} />}
                <span className="text-sm flex-1 truncate" style={{ color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }} title={fullNameOf(p)}>{fullNameOf(p)}</span>
                <button onClick={() => onRemoveStudent(p)} title="Remove from class"><X size={13} color={COLORS.rust} /></button>
              </div>
              <p className="text-xs mb-1.5 truncate" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>
                {p.personalInfo?.course || "—"} {p.personalInfo?.yearBlock ? `· ${p.personalInfo.yearBlock}` : ""}
              </p>
              <div className="flex flex-wrap gap-1">
                {LEVELS.map((l) => {
                  const done = p.progress[l.id].stagesCompleted.filter(Boolean).length;
                  const total = stageCountFor(l);
                  const abbr = (l.title.match(/\(([^)]+)\)/)?.[1] || l.title)[0];
                  return <Pill key={l.id}>{abbr} {done}/{total}</Pill>;
                })}
                <Pill><Star size={11} style={{ color: COLORS.gold }} /> {p.points}</Pill>
                <Pill><Award size={11} style={{ color: COLORS.moss }} /> {p.badges.length}</Pill>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TeacherDashboardScreen({ teacherName, teacherDepartment, codeDisplay, rosterByYear, loading, sortBy, onSortBy, onRefresh, onLogout, onRemoveStudent }) {
  const [tab, setTab] = useState("roster");
  const allStudents = YEAR_NUMS.flatMap((y) => rosterByYear[y] || []);
  const avgPoints = allStudents.length ? Math.round(allStudents.reduce((s, p) => s + p.points, 0) / allStudents.length) : 0;

  return (
    <div className="flex-1 p-5 sm:p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <div className="flex items-center gap-2">
          <Users size={22} style={{ color: COLORS.rust }} />
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: COLORS.ink }}>{teacherName}'s Class</h2>
        </div>
        <div className="flex items-center gap-2">
          {tab === "roster" && <button onClick={onRefresh} className="px-3 py-1.5 rounded-full text-sm" style={{ border: `1px solid ${COLORS.ink70}`, color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif" }}>Refresh</button>}
          <button onClick={onLogout} className="px-3 py-1.5 rounded-full text-sm" style={{ background: COLORS.gold, color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>Log out</button>
        </div>
      </div>
      <p className="mb-1" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>
        Permanent class code: <strong>{codeDisplay}</strong> — students add -1/-2/-3/-4 for their year (e.g. {codeDisplay}-2).
      </p>
      {teacherDepartment && (
        <p className="mb-4"><Pill>{teacherDepartment}</Pill></p>
      )}

      <div className="flex gap-2 mb-5">
        {[{ id: "roster", label: "Class Roster" }, { id: "questions", label: "Manage Questions" }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: tab === t.id ? COLORS.gold : COLORS.parchmentDeep, color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>{t.label}</button>
        ))}
      </div>

      {tab === "questions" ? (
        <QuestionManager />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl p-4" style={{ background: COLORS.parchmentDeep }}>
              <p className="text-2xl" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink }}>{allStudents.length}</p>
              <p className="text-sm" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>Registered students</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: COLORS.parchmentDeep }}>
              <p className="text-2xl" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink }}>{avgPoints}</p>
              <p className="text-sm" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>Average points</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>Sort each column by:</span>
            {["points", "name"].map((s) => (
              <button key={s} onClick={() => onSortBy(s)} className="px-3 py-1 rounded-full text-sm capitalize" style={{ background: sortBy === s ? COLORS.gold : COLORS.parchmentDeep, color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif" }}>{s}</button>
            ))}
          </div>

          {loading ? (
            <p style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>Reading the class roster…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {YEAR_NUMS.map((y) => (
                <YearColumn key={y} label={YEAR_LABELS[y]} students={rosterByYear[y] || []} sortBy={sortBy} onRemoveStudent={(p) => onRemoveStudent(p, y)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------- Teacher question manager ---------- */
function QuestionManager() {
  const [targetIdx, setTargetIdx] = useState(0);
  const target = MANAGE_TARGETS[targetIdx];
  const [stageIdx, setStageIdx] = useState(0);
  const [questions, setQuestions] = useState(null);
  const [hasOverride, setHasOverride] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;
    setQuestions(null);
    setStatus("");
    (async () => {
      const key = questionsKeyFor(target.id, stageIdx, !!target.stagePools);
      let override = null;
      try {
        const res = await window.storage.get(key, true);
        if (res) override = JSON.parse(res.value);
      } catch {}
      if (cancelled) return;
      if (override && override.length) { setQuestions(override); setHasOverride(true); }
      else { setQuestions(defaultEditablePool(target, stageIdx)); setHasOverride(false); }
    })();
    return () => { cancelled = true; };
  }, [targetIdx, stageIdx]);

  function updateClue(i, text) { setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, clue: text } : q))); }
  function updateOption(i, optIdx, text) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, options: q.options.map((o, oi) => (oi === optIdx ? text : o)) } : q)));
  }
  function setCorrect(i, optIdx) { setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, correct: optIdx } : q))); }
  function updateRationale(i, text) { setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, rationale: text } : q))); }
  function deleteQuestion(i) { setQuestions((qs) => qs.filter((_, idx) => idx !== i)); }
  function addQuestion() { setQuestions((qs) => [...qs, { clue: "", options: ["", "", "", ""], correct: 0, rationale: "" }]); }

  async function save() {
    const key = questionsKeyFor(target.id, stageIdx, !!target.stagePools);
    const cleaned = questions.filter((q) => q.clue.trim() && q.options.every((o) => o.trim()));
    try {
      await window.storage.set(key, JSON.stringify(cleaned), true);
      setQuestions(cleaned);
      setHasOverride(true);
      setStatus(`Saved ${cleaned.length} questions. Students will see these next time they play this stage.`);
    } catch {
      setStatus("Couldn't save changes. Please try again.");
    }
  }
  async function resetToDefault() {
    const key = questionsKeyFor(target.id, stageIdx, !!target.stagePools);
    try { await window.storage.delete(key, true); } catch {}
    setQuestions(defaultEditablePool(target, stageIdx));
    setHasOverride(false);
    setStatus("Reset to the default question set.");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        <div>
          <label className="block text-xs mb-1" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>Subject</label>
          <select value={targetIdx} onChange={(e) => { setTargetIdx(Number(e.target.value)); setStageIdx(0); }} className="px-3 py-2 rounded-lg text-sm" style={{ border: `1.5px solid ${COLORS.parchmentDeep}`, fontFamily: "'Space Grotesk', sans-serif" }}>
            {MANAGE_TARGETS.map((t, i) => <option key={t.id} value={i}>{t.title}</option>)}
          </select>
        </div>
        {target.stagePools && (
          <div>
            <label className="block text-xs mb-1" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>Stage</label>
            <select value={stageIdx} onChange={(e) => setStageIdx(Number(e.target.value))} className="px-3 py-2 rounded-lg text-sm" style={{ border: `1.5px solid ${COLORS.parchmentDeep}`, fontFamily: "'Space Grotesk', sans-serif" }}>
              {target.stageLabels.map((label, i) => <option key={label} value={i}>Stage {i + 1} · {label}</option>)}
            </select>
          </div>
        )}
        <div className="flex items-end">
          <Pill>{hasOverride ? "Custom questions" : "Default questions"}</Pill>
        </div>
      </div>

      {questions === null ? (
        <p style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>Loading questions…</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={addQuestion} className="px-3 py-1.5 rounded-full text-sm" style={{ border: `1px solid ${COLORS.ink70}`, color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif" }}>+ Add question</button>
            <button onClick={save} className="px-3 py-1.5 rounded-full text-sm" style={{ background: COLORS.gold, color: COLORS.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>Save changes</button>
            <button onClick={resetToDefault} className="px-3 py-1.5 rounded-full text-sm" style={{ border: `1px solid ${COLORS.rust}`, color: COLORS.rust, fontFamily: "'Space Grotesk', sans-serif" }}>Reset to default</button>
          </div>
          {status && <p className="mb-3 text-sm" style={{ color: COLORS.moss, fontFamily: "'Space Grotesk', sans-serif" }}>{status}</p>}

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {questions.map((q, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: COLORS.parchmentDeep }}>
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-xs mt-2" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>Q{i + 1}</span>
                  <textarea value={q.clue} onChange={(e) => updateClue(i, e.target.value)} rows={2} placeholder="Question text" className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ border: `1px solid ${COLORS.parchment}`, fontFamily: "'Space Grotesk', sans-serif" }} />
                  <button onClick={() => deleteQuestion(i)} className="p-2 rounded-full" title="Delete question"><X size={16} color={COLORS.rust} /></button>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 mb-2">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: q.correct === oi ? COLORS.moss : "white" }}>
                      <input type="radio" checked={q.correct === oi} onChange={() => setCorrect(i, oi)} title="Mark as correct answer" />
                      <input value={opt} onChange={(e) => updateOption(i, oi, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oi)}`} className="flex-1 bg-transparent outline-none text-sm" style={{ color: q.correct === oi ? "white" : COLORS.ink, fontFamily: "'Space Grotesk', sans-serif" }} />
                    </label>
                  ))}
                </div>
                <label className="block text-xs mb-1" style={{ color: COLORS.ink70, fontFamily: "'Space Grotesk', sans-serif" }}>Rationale (why the correct answer is correct)</label>
                <textarea value={q.rationale || ""} onChange={(e) => updateRationale(i, e.target.value)} rows={2} placeholder="Explain why the marked answer is correct — students see this after they answer." className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: `1px solid ${COLORS.parchment}`, fontFamily: "'Space Grotesk', sans-serif" }} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Root ---------- */
export default function GeoAdventure() {
  const [view, setView] = useState("login");
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [levelIdx, setLevelIdx] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [leaderRows, setLeaderRows] = useState([]);
  const [leaderLoading, setLeaderLoading] = useState(false);
  const [teacherCode, setTeacherCode] = useState(null);
  const [teacherName, setTeacherName] = useState("");
  const [teacherDepartment, setTeacherDepartment] = useState("");
  const [rosterByYear, setRosterByYear] = useState({ "1": [], "2": [], "3": [], "4": [] });
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterSortBy, setRosterSortBy] = useState("points");

  const [pendingName, setPendingName] = useState("");
  const [pendingProfile, setPendingProfile] = useState(null);
  const [pendingTeacherUsername, setPendingTeacherUsername] = useState("");
  const [pendingTeacherPassword, setPendingTeacherPassword] = useState("");

  async function handleStudentLogin(usernameInput, password) {
    setLoading(true);
    setErrorMsg("");
    try {
      const fullUsername = fullStudentUsername(usernameInput);
      if (!fullUsername) {
        setErrorMsg("Enter a username.");
        return;
      }
      let profile = null;
      try {
        const res = await window.storage.get(keyFor(fullUsername), true);
        profile = res ? normalizeProfile(JSON.parse(res.value), fullUsername) : null;
      } catch {
        profile = null;
      }
      if (profile) {
        if (profile.password) {
          if (profile.password !== password) {
            setErrorMsg("Incorrect password for that username.");
            return;
          }
        } else {
          profile.password = password;
          try { await window.storage.set(keyFor(fullUsername), JSON.stringify(profile), true); } catch {}
        }
        if (profile.teacherCode) {
          setPlayer(profile);
          setView(destinationAfterLogin(profile));
        } else {
          setPendingName(fullUsername);
          setPendingProfile(profile);
          setView("joinClass");
        }
      } else {
        const fresh = emptyProfile(fullUsername, password);
        setPendingName(fullUsername);
        setPendingProfile(fresh);
        setView("joinClass");
      }
    } catch {
      setErrorMsg("Couldn't reach the field log. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinClass(codeInput) {
    setLoading(true);
    setErrorMsg("");
    try {
      const parsed = parseJoinCode(codeInput);
      if (!parsed) {
        setErrorMsg("Add your year level to the code, like HUMGEO-1 (use -1, -2, -3, or -4).");
        return;
      }
      const { base, yearNum } = parsed;
      let teacherRecord = null;
      try {
        const res = await window.storage.get(teacherKeyFor(base), true);
        teacherRecord = res ? JSON.parse(res.value) : null;
      } catch {
        teacherRecord = null;
      }
      if (!teacherRecord) {
        setErrorMsg("That class code wasn't found. Double-check it with your teacher.");
        return;
      }
      const profile = pendingProfile || emptyProfile(pendingName);
      profile.teacherCode = base;
      profile.yearNum = yearNum;
      await window.storage.set(keyFor(pendingName), JSON.stringify(profile), true);
      await window.storage.set(rosterKeyFor(base, yearNum, pendingName), JSON.stringify({ name: pendingName.trim(), joinedAt: Date.now() }), true);
      setPlayer(profile);
      setView(destinationAfterLogin(profile));
    } catch {
      setErrorMsg("Couldn't reach the field log. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTeacherLogin(usernameInput, password) {
    setLoading(true);
    setErrorMsg("");
    try {
      const usernameKey = normalizeCode(usernameInput || "");
      if (!usernameKey) {
        setErrorMsg("Enter a username.");
        return;
      }
      let account = null;
      try {
        const res = await window.storage.get(teacherAccountKeyFor(usernameKey), true);
        account = res ? JSON.parse(res.value) : null;
      } catch {
        account = null;
      }
      if (account) {
        if (account.password !== password) {
          setErrorMsg("Incorrect password for that username.");
          return;
        }
        setTeacherCode(account.classCode);
        setTeacherName(account.name);
        setTeacherDepartment(account.department || "");
        setView("teacherDashboard");
        loadRoster(account.classCode);
      } else {
        setPendingTeacherUsername(usernameKey);
        setPendingTeacherPassword(password);
        setView("teacherSetup");
      }
    } catch {
      setErrorMsg("Couldn't reach the class log. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTeacherSetup(name, department, codeInput) {
    setLoading(true);
    setErrorMsg("");
    try {
      const classCodeKey = normalizeCode(codeInput || "");
      if (!classCodeKey) {
        setErrorMsg("Choose a permanent class code.");
        return;
      }
      const account = { username: pendingTeacherUsername, password: pendingTeacherPassword, name: name.trim(), department: department || "", classCode: classCodeKey, createdAt: Date.now() };
      await window.storage.set(teacherAccountKeyFor(pendingTeacherUsername), JSON.stringify(account), true);
      let classRecord = null;
      try {
        const res = await window.storage.get(teacherKeyFor(classCodeKey), true);
        classRecord = res ? JSON.parse(res.value) : null;
      } catch {
        classRecord = null;
      }
      if (!classRecord) {
        classRecord = { name: name.trim(), department: department || "", code: codeInput.trim(), createdAt: Date.now() };
        await window.storage.set(teacherKeyFor(classCodeKey), JSON.stringify(classRecord), true);
      }
      setTeacherCode(classCodeKey);
      setTeacherName(account.name);
      setTeacherDepartment(account.department);
      setView("teacherDashboard");
      loadRoster(classCodeKey);
    } catch {
      setErrorMsg("Couldn't save your class setup. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function loadRoster(baseCodeKey) {
    setRosterLoading(true);
    try {
      const byYear = {};
      for (const y of YEAR_NUMS) {
        const list = await window.storage.list(rosterPrefixFor(baseCodeKey, y), true);
        const keys = list?.keys || [];
        const students = [];
        for (const k of keys) {
          try {
            const rosterRes = await window.storage.get(k, true);
            if (!rosterRes) continue;
            const entry = JSON.parse(rosterRes.value);
            const pRes = await window.storage.get(keyFor(entry.name), true);
            students.push(pRes ? normalizeProfile(JSON.parse(pRes.value), entry.name) : emptyProfile(entry.name));
          } catch {}
        }
        byYear[y] = students;
      }
      setRosterByYear(byYear);
    } catch {
      setRosterByYear({ "1": [], "2": [], "3": [], "4": [] });
    } finally {
      setRosterLoading(false);
    }
  }

  async function removeStudentFromClass(studentProfile, yearNum) {
    if (!teacherCode) return;
    try { await window.storage.delete(rosterKeyFor(teacherCode, yearNum, studentProfile.name), true); } catch {}
    try {
      const res = await window.storage.get(keyFor(studentProfile.name), true);
      const current = res ? normalizeProfile(JSON.parse(res.value), studentProfile.name) : null;
      if (current) {
        current.teacherCode = null;
        current.yearNum = null;
        await window.storage.set(keyFor(studentProfile.name), JSON.stringify(current), true);
      }
    } catch {}
    setRosterByYear((byYear) => ({
      ...byYear,
      [yearNum]: byYear[yearNum].filter((s) => s.name.toLowerCase() !== studentProfile.name.toLowerCase()),
    }));
  }

  async function persist(updated) {
    setPlayer(updated);
    try { await window.storage.set(keyFor(updated.name), JSON.stringify(updated), true); } catch {}
  }

  function openLevel(i) { setLevelIdx(i); setView("stageSelect"); }
  function openStage(i) { setStageIdx(i); setAttempt((a) => a + 1); setView("stage"); }
  function retryStage() { setAttempt((a) => a + 1); setView("stage"); }

  function submitPersonalInfo(info) {
    const updated = { ...player, personalInfo: info };
    persist(updated);
    setView(destinationAfterLogin(updated));
  }

  function chooseAvatar(avatarId) {
    const updated = { ...player, avatar: avatarId };
    persist(updated);
    setView(destinationAfterLogin(updated));
  }

  function finishStage(correct, earned) {
    const level = LEVELS[levelIdx];
    const passed = correct >= PASS_THRESHOLD;
    const stars = starsFor(correct);
    const prog = { ...player.progress[level.id] };
    prog.stagesCompleted = [...prog.stagesCompleted];
    prog.stagesStars = [...prog.stagesStars];
    if (passed) prog.stagesCompleted[stageIdx] = true;
    if (stars > prog.stagesStars[stageIdx]) prog.stagesStars[stageIdx] = stars;

    const newProgress = { ...player.progress, [level.id]: prog };
    let badges = player.badges;
    let levelJustCompleted = false;
    if (passed && prog.stagesCompleted.every(Boolean) && !badges.includes(level.badge)) {
      badges = [...badges, level.badge];
      levelJustCompleted = true;
    }
    if (LEVELS.every((l) => newProgress[l.id].stagesCompleted.every(Boolean)) && !badges.includes(MASTER_BADGE)) {
      badges = [...badges, MASTER_BADGE];
    }
    const updated = { ...player, points: player.points + earned, badges, progress: newProgress };
    setLastResult({ correct, earned, passed, levelJustCompleted });
    persist(updated);
    setView("stageComplete");
  }

  async function openLeaderboard() {
    setView("leaderboard");
    setLeaderLoading(true);
    try {
      const list = await window.storage.list("player:", true);
      const keys = list?.keys || [];
      const rows = [];
      for (const k of keys) {
        try { const res = await window.storage.get(k, true); if (res) rows.push(normalizeProfile(JSON.parse(res.value), "")); } catch {}
      }
      const classRows = player?.teacherCode ? rows.filter((r) => r.teacherCode === player.teacherCode) : rows;
      classRows.sort((a, b) => b.points - a.points);
      setLeaderRows(classRows);
    } catch { setLeaderRows([]); } finally { setLeaderLoading(false); }
  }

  function logout() { setPlayer(null); setView("login"); }
  function teacherLogout() { setTeacherCode(null); setTeacherName(""); setTeacherDepartment(""); setPendingTeacherUsername(""); setPendingTeacherPassword(""); setRosterByYear({ "1": [], "2": [], "3": [], "4": [] }); setView("login"); }

  const level = LEVELS[levelIdx];

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: COLORS.parchment }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Space+Grotesk:wght@400;500;700&display=swap');`}</style>

      {view !== "login" && view !== "joinClass" && view !== "personalInfo" && view !== "avatarSelect" && view !== "teacherSetup" && view !== "teacherDashboard" && player && (
        <TopBar player={player} active={view} onBadges={() => setView("badges")} onLeaderboard={openLeaderboard} onLogout={logout} onHome={() => setView("levelSelect")} />
      )}

      {view === "login" && <LoginScreen onStudentLogin={handleStudentLogin} onTeacherLogin={handleTeacherLogin} loading={loading} errorMsg={errorMsg} />}
      {view === "joinClass" && (
        <JoinClassScreen name={pendingName} onJoin={handleJoinClass} onBack={() => { setErrorMsg(""); setView("login"); }} loading={loading} errorMsg={errorMsg} />
      )}
      {view === "personalInfo" && player && <PersonalInfoScreen onSubmit={submitPersonalInfo} />}
      {view === "avatarSelect" && player && <AvatarSelectScreen name={player.name} onChoose={chooseAvatar} />}
      {view === "teacherSetup" && (
        <TeacherSetupScreen onSubmit={handleTeacherSetup} onBack={() => { setErrorMsg(""); setView("login"); }} loading={loading} errorMsg={errorMsg} />
      )}
      {view === "teacherDashboard" && (
        <TeacherDashboardScreen
          teacherName={teacherName} teacherDepartment={teacherDepartment}
          codeDisplay={teacherCode} rosterByYear={rosterByYear} loading={rosterLoading}
          sortBy={rosterSortBy} onSortBy={setRosterSortBy} onRefresh={() => loadRoster(teacherCode)} onLogout={teacherLogout}
          onRemoveStudent={removeStudentFromClass}
        />
      )}
      {view === "levelSelect" && player && <LevelSelectScreen player={player} onOpenLevel={openLevel} />}
      {view === "stageSelect" && player && <StageSelectScreen level={level} player={player} onBack={() => setView("levelSelect")} onOpenStage={openStage} />}
      {view === "stage" && player && <StageScreen level={level} stageIdx={stageIdx} attempt={attempt} onExit={() => setView("stageSelect")} onFinish={finishStage} />}
      {view === "stageComplete" && player && lastResult && (
        <StageCompleteScreen
          level={level} stageIdx={stageIdx} correct={lastResult.correct} earned={lastResult.earned}
          passed={lastResult.passed} levelJustCompleted={lastResult.levelJustCompleted}
          onRetry={retryStage} onContinue={() => setView("stageSelect")}
        />
      )}
      {view === "badges" && player && <BadgesScreen player={player} />}
      {view === "leaderboard" && player && <LeaderboardScreen rows={leaderRows} loading={leaderLoading} currentName={player.name.toLowerCase()} />}
    </div>
  );
}
