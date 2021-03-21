import { Block }         from './actor/Block';
import { QuestionBlock } from './actor/QuestionBlock';
import { BrokenMonitor } from './actor/BrokenMonitor';
import { MarbleBlock }   from './actor/MarbleBlock';
import { CompanionBlock }   from './actor/CompanionBlock';
import { LayerSwitch }   from './actor/LayerSwitch';

import { Explosion } from './actor/Explosion';
import { StarPost }  from './actor/StarPost';
import { Emerald }   from './actor/Emerald';
import { Window }    from './actor/Window';
import { Monitor }   from './actor/Monitor';
import { Spring }    from './actor/Spring';

import { Ring } from './actor/Ring';
import { Coin } from './actor/Coin';

import { WaterFall } from './actor/WaterFall';
import { WaterJet }  from './actor/WaterJet';

import { PowerupGlow } from './actor/PowerupGlow';
// import { SuperRing }   from './actor/SuperRing';

import { PointActor } from './actor/PointActor';

import { Projectile } from './actor/Projectile';
import { TextActor }  from './actor/TextActor';

import { EggMobile } from './actor/EggMobile';
import { DrillCar }  from './actor/DrillCar';
import { Tornado }   from './actor/Tornado';

import { NuclearSuperball } from './actor/NuclearSuperball';

import { MechaSonic } from './actor/MechaSonic';
import { Eggrobo }    from './actor/Eggrobo';
import { Eggman }     from './actor/Eggman';

import { Sonic }      from './actor/Sonic';
import { Tails }      from './actor/Tails';
import { Knuckles }   from './actor/Knuckles';

import { Seymour } from './actor/Seymour';

import { Rocks }  from './actor/Rocks';
import { Switch } from './actor/Switch';
import { Balloon } from './actor/Balloon';

import { Region } from './region/Region';


import { WaterRegion } from './region/WaterRegion';
import { ShadeRegion } from './region/ShadeRegion';

export const ObjectPalette = {
	player:           NuclearSuperball
	, spring:         Spring
	, 'layer-switch': LayerSwitch
	, 'star-post':    StarPost
	, 'projectile':   Projectile
	, 'block':           Block
	, 'q-block':         QuestionBlock
	, 'marble-block':    MarbleBlock
	, 'companion-block': CompanionBlock
	, 'drill-car':    DrillCar
	, 'tornado':      Tornado
	, 'egg-mobile':   EggMobile
	, 'rocks-tall':   Rocks
	, 'rocks-med':    Rocks
	, 'rocks-short':  Rocks
	, 'mecha-sonic':  MechaSonic
	, 'sonic':        Sonic
	, 'tails':        Tails
	, 'knuckles':     Knuckles
	, 'eggman':       Eggman
	, 'eggrobo':      Eggrobo
	, 'seymour':      Seymour
	, 'switch':       Switch
	, 'window':       Window
	, 'emerald':      Emerald
	, 'region':       WaterRegion
	, 'shade-region': ShadeRegion
	, 'ring':         Ring
	// , 'super-ring':   SuperRing
	, 'coin':         Coin
	, 'powerup-glow': PowerupGlow
	, 'explosion':    Explosion
	, 'text-actor':   TextActor
	, 'water-jet':    WaterJet
	, 'water-fall':   WaterFall
	, 'balloon':      Balloon
};


