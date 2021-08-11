import { PointActor } from './actor/PointActor';

import { LayerSwitch }    from './actor/LayerSwitch';

import { Region }      from './region/Region';
import { ShadeRegion } from './region/ShadeRegion';
import { WaterRegion } from './region/WaterRegion';
import { LavaRegion } from './region/LavaRegion';
import { RollingRegion } from './region/RollingRegion';
import { GrindingRegion } from './region/GrindingRegion';
import { ForceRegion } from './region/ForceRegion';
import { CorkscrewRegion } from './region/CorkscrewRegion';
import { BossRegion } from './region/BossRegion';
import { ExitRegion } from './region/ExitRegion';
import { ExplodingRegion } from './region/ExplodingRegion'
import { SwitchRegion } from './region/SwitchRegion'
import { RainRegion } from './region/RainRegion'
import { WaterfallRegion } from './region/WaterfallRegion'

import { CompanionBlock } from './actor/CompanionBlock';
import { QuestionBlock }  from './actor/QuestionBlock';
import { MarbleBlock }    from './actor/MarbleBlock';
import { BreakableBlock }    from './actor/BreakableBlock';
import { Stopper }    from './actor/Stopper';
import { Block }          from './actor/Block';

import { Monitor }   from './actor/Monitor';
import { RingMonitor } from './actor/monitor/RingMonitor';
import { SheildStarMonitor } from './actor/monitor/SheildStarMonitor';
import { SheildFireMonitor } from './actor/monitor/SheildFireMonitor';
import { SheildWaterMonitor } from './actor/monitor/SheildWaterMonitor';
import { SheildElectricMonitor } from './actor/monitor/SheildElectricMonitor';

import { Bumper } from './actor/Bumper';

import { Cinematic } from './actor/Cinematic';

import { Flickie } from './actor/Flickie';

import { Bubbles } from './actor/Bubbles';
import { GuardBot } from './actor/GuardBot';
import { CrabMeat } from './actor/CrabMeat';
import { BuzzBomber } from './actor/BuzzBomber';
import { MechaFroggy } from './actor/MechaFroggy';
import { DrainFly } from './actor/DrainFly';

import { Explosion } from './actor/Explosion';
import { StarPost }  from './actor/StarPost';
import { ArrowSign }  from './actor/ArrowSign';
import { Emerald }   from './actor/Emerald';
import { Window }    from './actor/Window';
import { Spring }    from './actor/Spring';

import { BrokenMonitor }  from './actor/BrokenMonitor';

import { Ring } from './actor/Ring';
import { Coin } from './actor/Coin';

import { WaterFall } from './actor/WaterFall';
import { WaterJet }  from './actor/WaterJet';

import { PowerupGlow } from './actor/PowerupGlow';
// import { SuperRing }   from './actor/SuperRing';

import { Projectile } from './actor/Projectile';
import { TextActor }  from './actor/TextActor';

import { EggMobile } from './actor/EggMobile';
import { DrillCar }  from './actor/DrillCar';
import { Tornado }   from './actor/Tornado';
import { RailCar }  from './actor/RailCar';

import { NuclearSuperball } from './actor/NuclearSuperball';

import { MechaSonic } from './actor/MechaSonic';
import { Eggrobo }    from './actor/Eggrobo';
import { Eggman }     from './actor/Eggman';

import { Sonic }      from './actor/Sonic';
import { Tails }      from './actor/Tails';
import { Knuckles }   from './actor/Knuckles';

import { Seymour } from './actor/Seymour';
import { Chalmers } from './actor/Chalmers';

import { Sean } from './actor/Sean';

import { Rocks }  from './actor/Rocks';
import { Switch } from './actor/Switch';
import { Balloon } from './actor/Balloon';
import { StarBalloon } from './actor/StarBalloon';

import { Spinner } from './actor/Spinner';
import { Springboard } from './actor/Springboard';

import { GrapplePoint } from './actor/GrapplePoint';
import { WoodenCrate } from './actor/WoodenCrate';
import { SteelCrate } from './actor/SteelCrate';
import { UnbreakableCrate } from './actor/UnbreakableCrate';
import { Rocket } from './actor/Rocket';

import { RoadBarrier } from './actor/RoadBarrier';
import { Spikes } from './actor/Spikes';
import { Cone } from './actor/Cone';

import { Signpost } from './actor/Signpost';

import { RedEyeJet } from './actor/RedEyeJet';
import { MiniMace } from './actor/MiniMace';
import { Beelzebub } from './actor/Beelzebub';
import { Magnet	 } from './actor/Magnet';

import { Orb } from './actor/Orb';

import { BackdropSwapper } from './actor/BackdropSwapper';
import { LayerController } from './actor/LayerController';
import { WaterController } from './actor/WaterController';
import { TilesetSwapper } from './actor/TilesetSwapper';
import { CutScene } from './actor/CutScene';

export const ObjectPalette = {
	player:           NuclearSuperball
	, cinematic:      Cinematic
	, spring:         Spring
	, 'layer-switch': LayerSwitch
	, 'layer-controller': LayerController
	, 'water-controller': WaterController
	, 'backdrop-swapper': BackdropSwapper
	, 'tileset-swapper':  TilesetSwapper
	, 'star-post':    StarPost
	, 'arrow-sign':   ArrowSign
	, 'projectile':   Projectile
	, 'block':           Block
	, 'q-block':         QuestionBlock
	, 'marble-block':    MarbleBlock
	, 'companion-block': CompanionBlock
	, 'breakable-block': BreakableBlock
	, 'stopper': Stopper
	, 'bumper':       Bumper
	, 'drill-car':    DrillCar
	, 'rail-car':     RailCar
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
	, 'chalmers':     Chalmers
	, 'sean':         Sean
	, 'switch':       Switch
	, 'window':       Window
	, 'emerald':      Emerald
	, 'base-region':  Region
	, 'region':       WaterRegion
	, 'lava-region':  LavaRegion
	, 'shade-region': ShadeRegion
	, 'force-region': ForceRegion
	, 'corkscrew-region': CorkscrewRegion
	, 'rolling-region': RollingRegion
	, 'grinding-region': GrindingRegion
	, 'exploding-region': ExplodingRegion
	, 'boss-region': BossRegion
	, 'exit-region': ExitRegion
	, 'switch-region': SwitchRegion
	, 'rain-region': RainRegion
	, 'waterfall-region': WaterfallRegion
	, 'ring':         Ring
	// , 'super-ring':   SuperRing
	, 'coin':         Coin
	, 'powerup-glow': PowerupGlow
	, 'explosion':    Explosion
	, 'text-actor':   TextActor
	, 'water-jet':    WaterJet
	, 'water-fall':   WaterFall
	, 'balloon':      Balloon
	, 'star-balloon': StarBalloon
	, 'ring-monitor': RingMonitor
	, 'sheild-fire-monitor': SheildFireMonitor
	, 'sheild-star-monitor': SheildStarMonitor
	, 'sheild-water-monitor': SheildWaterMonitor
	, 'sheild-electric-monitor': SheildElectricMonitor
	, 'flickie': Flickie
	, 'crabmeat': CrabMeat
	, 'guard-bot': GuardBot
	, 'mecha-froggy': MechaFroggy
	, 'buzz-bomber': BuzzBomber
	, 'bubbles': Bubbles
	, 'drainfly': DrainFly
	, 'grapple-point': GrapplePoint
	, 'rocket': Rocket
	, 'spinner': Spinner
	, 'springboard': Springboard
	, 'wooden-crate': WoodenCrate
	, 'steel-crate': SteelCrate
	, 'unbreakable-crate': UnbreakableCrate
	, 'road-barrier': RoadBarrier
	, 'signpost': Signpost
	, 'red-eye-jet': RedEyeJet
	, 'beelzebub': Beelzebub
	, 'mini-mace': MiniMace
	, 'magnet': Magnet
	, 'spikes': Spikes
	, 'cone': Cone
	, 'orb': Orb
	, 'cut-scene': CutScene
};
