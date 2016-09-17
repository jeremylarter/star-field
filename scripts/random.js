/*global Rx, console*/

//helper function to generate static sets of random numbers to a log
// (function (log) {
//     "use strict";
//     var numberOfRandomNumbers = 1000,
//         randomArray = [];
//     Rx.Observable.range(0, numberOfRandomNumbers)
//         .subscribe(function () {
//             randomArray.push(Math.random());
//         });
//     log("[" + randomArray.join(", ") + "]");
// }(console.log));

var Random = (function () {
    "use strict";

    var index = 0,
        staticRandom = [0.44676716585679466, 0.5284807317319344, 0.6547939295791956, 0.24703757434981366, 0.9891336699591475, 0.43565728518577806, 0.5004099534765998, 0.1668803600091866, 0.8912425844506415, 0.21002274929042142, 0.6641346626921103, 0.9128739344706756, 0.7771810919381934, 0.07549313803832058, 0.8299805554576607, 0.18893363302592436, 0.415273912615846, 0.4002959926806511, 0.046859268708163926, 0.6779397824044187, 0.545320981138188, 0.3905662855420964, 0.21731357388849526, 0.4013049153938355, 0.4145178509891887, 0.7408768123995677, 0.1570502103703082, 0.2245536063784559, 0.16189302216436108, 0.12368822939065738, 0.605376080862764, 0.6821250696142827, 0.15390468231016796, 0.43988037412480807, 0.45612927825107175, 0.7566490580713792, 0.19640148712728012, 0.6694263539354168, 0.5894194952322196, 0.3432197189121744, 0.4532627993866465, 0.9923937774408849, 0.3317642410563906, 0.9784436959502858, 0.2365184247440104, 0.6227063100494195, 0.6182358023189414, 0.4147486494728714, 0.1696399896605345, 0.28969926256738043, 0.7267579247028011, 0.3130542775938907, 0.11542494116412927, 0.32301482222701305, 0.06746970257591989, 0.26873772130091145, 0.5012157047056442, 0.7896619384131276, 0.5402762008048037, 0.5958485888492051, 0.5669546747107317, 0.2923067585462522, 0.23188216990626787, 0.9141626706684247, 0.6220705723540052, 0.7755502688764502, 0.34315792271182777, 0.5857328147868759, 0.403738278067973, 0.26589269461695975, 0.2733887626432614, 0.2797532444835109, 0.37639267843159985, 0.17977999700143799, 0.9716585992567544, 0.8174121398931347, 0.06852583706271109, 0.9227915199691126, 0.16716846041747102, 0.7154341170535834, 0.8914332813205623, 0.6916639204246811, 0.731965445789841, 0.35540589127596545, 0.3694620434162186, 0.7973481665906326, 0.9002646826587914, 0.6823958873897911, 0.13807653195444014, 0.9075639034772427, 0.09716322600623584, 0.12099336994072707, 0.34758606108368295, 0.7473657794730144, 0.9913124926546777, 0.15011430689316096, 0.06623934718985613, 0.003748047993133108, 0.6562927075769087, 0.7704489074785967, 0.22149015438480713, 0.5519498391846693, 0.2199721244003654, 0.19809596818166675, 0.46101611724496117, 0.6684525642222265, 0.1382051303774836, 0.00932839037522748, 0.6200503416858563, 0.07108906352697231, 0.8710693605615782, 0.4696013408885267, 0.15978138910884576, 0.9525111016012227, 0.5192455355640653, 0.8919753670436981, 0.9914264251611389, 0.27861283163684547, 0.7678432417981997, 0.5482732556735672, 0.1610863960342288, 0.23062926288955254, 0.17132545517481734, 0.24032880815515267, 0.8312958738166314, 0.5553392663140901, 0.0348673519541165, 0.021089726184346125, 0.698144835898439, 0.6829549072475221, 0.5367617098181272, 0.5798532079439076, 0.6130977179932506, 0.24378940486237832, 0.09664446176122077, 0.9138648426850955, 0.05080565876374532, 0.6424030665965264, 0.042484101765969395, 0.8315560745191666, 0.7910790433009591, 0.09261133161118473, 0.041947098515198844, 0.5213442545381073, 0.42645513797496637, 0.15504768316326634, 0.09451911991365991, 0.49830966143908184, 0.8367884862812398, 0.5711584407925738, 0.3691403144484713, 0.43970103863943, 0.4163381807147213, 0.03005947784331342, 0.49212874294010134, 0.2890194873898815, 0.45390855315980927, 0.8288384342641921, 0.038689965290463535, 0.18182792842678275, 0.8793061725641949, 0.7862597320585181, 0.7771512130575899, 0.8715418437507392, 0.5461209451860798, 0.9573245726023218, 0.28545631146419836, 0.2624500283017466, 0.9069849318561276, 0.1787126860699788, 0.2261728885543084, 0.5741276188664763, 0.7351238267786253, 0.327989356016791, 0.36912902459247676, 0.9458598868809065, 0.4282050232190686, 0.15453472057757112, 0.12532182421629412, 0.45899588389000345, 0.525551163518678, 0.8762629245482552, 0.784098189670277, 0.3369517505273436, 0.6531631787072749, 0.5049049347837267, 0.2809234772208904, 0.7653609670591597, 0.7358483366078199, 0.4916798442214725, 0.4209348346385129, 0.31991141518149324, 0.8351498607107428, 0.40097579809853934, 0.10088527532118574, 0.8007336950363078, 0.2462324590856, 0.9234029691606156, 0.2508063965535374, 0.9307738987446288, 0.5795556574444498, 0.08452529312112378, 0.952978904365978, 0.713221205360576, 0.8501498512518739, 0.8968096564636914, 0.8489967358203179, 0.8294687109011556, 0.001293662101419235, 0.10644627182658106, 0.8805321180911743, 0.8887458600884635, 0.8210146377718943, 0.00752128464149493, 0.8444513583459765, 0.8601123154223107, 0.09311498516968086, 0.9782494859543285, 0.5641126241863694, 0.1995487643328786, 0.35817347055717863, 0.7923281920693688, 0.5598779176650848, 0.4557035475401452, 0.05548658636940118, 0.6061946147885391, 0.8634607409311308, 0.520436317095041, 0.13889807440923185, 0.594322681457413, 0.16354605970775893, 0.8953148476718322, 0.4907356408333139, 0.6036250578571305, 0.761372639493991, 0.22640925157931324, 0.5781509139593546, 0.8354263895023177, 0.17977141230804894, 0.5826140925862062, 0.9602413849178808, 0.2164218252440191, 0.522560810201087, 0.003094352575800041, 0.21886232150305673, 0.9634716194405655, 0.2587736228396913, 0.6970158294154065, 0.8002002912347903, 0.7141131790297288, 0.1935987526795655, 0.7474520491063061, 0.34474488878515874, 0.1841973443974403, 0.579520256198411, 0.5356766133025497, 0.732008008852211, 0.39714721752881177, 0.33808831754947444, 0.652026200104086, 0.1127016226609796, 0.7852596730487009, 0.5561480664468641, 0.41276998710085944, 0.7479727449373816, 0.5101451060484254, 0.5781158457817184, 0.7010543547387995, 0.10546219242160193, 0.9230969508044369, 0.10370131883386335, 0.31672714991377315, 0.6673783854603594, 0.4565795712206331, 0.8811617614539922, 0.2752202599068978, 0.19166938192413863, 0.3931199865639037, 0.05633197862611672, 0.2447722437993456, 0.5111124721175824, 0.3982510404230233, 0.7802934739773577, 0.6281402983258262, 0.45979593227718474, 0.7346015030002409, 0.26186013275437836, 0.5684796547161506, 0.6845827881747013, 0.3574572523698931, 0.7668881596083619, 0.38976096977121455, 0.14572599813751963, 0.32493833467151445, 0.546177791323351, 0.6281606602990895, 0.49002126851349437, 0.3037309110587998, 0.3662172329088107, 0.03879168838370206, 0.06996971530892582, 0.16976521589565063, 0.0788831606072089, 0.493037502179563, 0.48021530388886635, 0.07592260489320313, 0.6104572805933131, 0.15410431075530395, 0.40461589430522693, 0.36827550575614465, 0.4346833459845769, 0.358769214490674, 0.717493809432395, 0.24152077775827663, 0.4707132655983506, 0.042355320913555206, 0.7889018905156655, 0.33850164313123776, 0.9168578802212575, 0.6716176379329413, 0.9339539035317468, 0.22619426703590872, 0.8890679383135862, 0.5022374799580156, 0.17742233499214888, 0.17479402059918137, 0.1906664591251288, 0.2761769712662885, 0.6380145036178726, 0.4208424156350805, 0.2699105134166928, 0.5986053635911324, 0.376085765929115, 0.3959068221134616, 0.6673098964793993, 0.024455040410751083, 0.6122231163528782, 0.8757831767826216, 0.8888750820257099, 0.8969678735849942, 0.3222813992483795, 0.7857833056969399, 0.5631019859421611, 0.46840288392182994, 0.42137784222827035, 0.10256525754746759, 0.8959937441230148, 0.24246236189634707, 0.9360827096516193, 0.5425670650158527, 0.1126690519699789, 0.8933359017568703, 0.5270578577687495, 0.1465802798635918, 0.5774295118879533, 0.8187976598259037, 0.6678696498393777, 0.764226910763498, 0.6070317652667114, 0.0940421523196382, 0.11317594354987115, 0.9650639234648821, 0.044445835649677745, 0.6240236155969867, 0.4992163269425045, 0.33791548199875443, 0.007726446358380157, 0.6730911712833785, 0.9731492034360529, 0.7419782197571301, 0.6727233008522762, 0.6635398556519476, 0.7313357666321283, 0.642570161336879, 0.931918022872338, 0.8443409577539549, 0.408847034781495, 0.17139908139974303, 0.2590309952968344, 0.6482996271186909, 0.29098521591921145, 0.38186070586102994, 0.07837748559695168, 0.17037319144811214, 0.9434875656860238, 0.48933954916502076, 0.30768731395180615, 0.8750777326367665, 0.704264833053603, 0.4136775310798326, 0.007959459306036809, 0.11181920622444452, 0.9606666405910447, 0.7519000934020066, 0.21417237543568746, 0.5776229628719867, 0.028247290421081983, 0.21464052547034762, 0.21397493949964064, 0.06865357634257485, 0.2535985100748086, 0.46926083882094805, 0.32376026769265054, 0.36989299612542315, 0.2607063370597338, 0.5789922081826866, 0.48785815304292646, 0.3984743962480579, 0.04878795736702246, 0.39622798804728676, 0.903169938200511, 0.3846297162440524, 0.8430482560694399, 0.45344996417788885, 0.39775482773082294, 0.8894044234634078, 0.03866070778431174, 0.12721967761313024, 0.5592252640849249, 0.6227139439363152, 0.2629662492654532, 0.5769632999290708, 0.7112328147699383, 0.7724663954324997, 0.7242332300031638, 0.34151901314753164, 0.27128228191611203, 0.525230813873871, 0.8605249339024044, 0.47052504119376315, 0.08337491739810088, 0.4343122020002621, 0.44110104938145867, 0.6737492307174988, 0.22794367014002925, 0.02690624552619192, 0.6149886023645164, 0.267501985342979, 0.27206735363892975, 0.6262350560043386, 0.9149394280798488, 0.16524686034396097, 0.28080389267440853, 0.028892146869795576, 0.019714089657056233, 0.543210571854357, 0.48402142627163314, 0.3415141792183283, 0.7288502879783831, 0.29178106820991445, 0.4584754581544197, 0.6243714772549442, 0.11990712000827886, 0.16024711041907613, 0.40361871730758225, 0.1417723716049044, 0.1567830520649376, 0.8298618588624718, 0.7755117547105292, 0.711228315388682, 0.9023280080136604, 0.7252548351945536, 0.4406291697163556, 0.6949178040618831, 0.2442238335206388, 0.5204147728403836, 0.9732805861074292, 0.45973587404400584, 0.9026872398090995, 0.23095164098280807, 0.24203034648840394, 0.3115276368216344, 0.3094674540556748, 0.9867801682233837, 0.6798354401481901, 0.12589825211264039, 0.6371761319375875, 0.4951493736295869, 0.30573005105149464, 0.07805312815690191, 0.13475172478218456, 0.8107366266620806, 0.6694362144250636, 0.7580084832255782, 0.3075640542404705, 0.07597189602644949, 0.5881836771946267, 0.02945179173275525, 0.004235202360810764, 0.7030904642402596, 0.7793093953674572, 0.5709446025490099, 0.9657178921098306, 0.05655784371695627, 0.8954597897790184, 0.30267647930809227, 0.6684536845668334, 0.777368069506303, 0.815014446990771, 0.6645552683464866, 0.6750929881579926, 0.6546462369641899, 0.6281191853083252, 0.9198464220463858, 0.5347828575766962, 0.424342969066416, 0.6957029200255596, 0.9425190278825271, 0.5961592939450104, 0.6749748040396593, 0.3662292775749836, 0.9622932925891865, 0.8716813053236196, 0.2207058587818287, 0.8173732114590371, 0.9129219422404213, 0.6033124329928281, 0.11660511178962363, 0.5199267885687133, 0.6858684614895147, 0.3394525854949082, 0.47644551824018255, 0.8963506543665571, 0.2258425300215552, 0.7857147083926361, 0.5350697154112039, 0.029637193553864405, 0.8879411956537666, 0.10123440503427084, 0.9115684705822125, 0.8125467286123291, 0.5574756793606639, 0.9768399912049717, 0.8766660186799891, 0.39590638672773126, 0.10741002504892627, 0.10885082033298832, 0.13945735931947434, 0.459865192467634, 0.2600303809158857, 0.9104623640043634, 0.9964481404802954, 0.8556585597818591, 0.4051877628947287, 0.8444323878271216, 0.09342475555610275, 0.8640855094837896, 0.8971724679132898, 0.769816728121129, 0.6296626027978731, 0.26616779991894, 0.0757303917971941, 0.6775144515336611, 0.18628103456761913, 0.6951798437633068, 0.5894071061358432, 0.9359414608982191, 0.2555355084085018, 0.7518628796718079, 0.16963752111563624, 0.6037043876302444, 0.4826619883765555, 0.9144799689860665, 0.31835522164923113, 0.7774556738559033, 0.9980275539502685, 0.572748145361935, 0.28539438842879483, 0.01050003271407629, 0.015101285820687593, 0.6636139646155801, 0.5445068986097843, 0.5147313347857854, 0.19512209580171347, 0.7768441461390401, 0.10889452760855511, 0.6419512724434335, 0.49615011252025853, 0.16689916987193598, 0.06125097091096543, 0.2363722072566421, 0.40150895723662683, 0.6902653566841472, 0.6906659113508915, 0.5881384330064718, 0.2464433102966379, 0.4906921552834378, 0.9993927751517533, 0.11592392319500822, 0.042258507699346026, 0.36830376693477285, 0.6260039113788611, 0.924642478976214, 0.20643354243155376, 0.17568980231054665, 0.07727961192155819, 0.6544756596891252, 0.9755315058655862, 0.18276919200329322, 0.35640352624103655, 0.03078990107773838, 0.5836152006288695, 0.7826668902751421, 0.05673654130313022, 0.6959301672793177, 0.22615901254276038, 0.40897424529900883, 0.4457384644525537, 0.6737757496850723, 0.9642980425792516, 0.6880533257018131, 0.4533841324086991, 0.029572555626483643, 0.46158944158923076, 0.6428900640003696, 0.45565072193934886, 0.39959196242128403, 0.30065877688207543, 0.4778261987119068, 0.8543612142827481, 0.13484390460867912, 0.8307528968646731, 0.6146988818227062, 0.041600435360338306, 0.8967273742345689, 0.9646778249906163, 0.19289039021416254, 0.8365312575405064, 0.15361016813828865, 0.3085718121428891, 0.5557826292370756, 0.8070533914587115, 0.7337736433333713, 0.8055337811574865, 0.4002712748098445, 0.7207020074447612, 0.7293314232313186, 0.7175180575139875, 0.3575113258445515, 0.23970370361709326, 0.09312501740483703, 0.9619304985083219, 0.4197740049966001, 0.13229228269957538, 0.8682360779179119, 0.06482676940160381, 0.2099319700203035, 0.6980679661725526, 0.2502394720773109, 0.20116726875529634, 0.4042977178767857, 0.36136414367219505, 0.019307246114790066, 0.2989349786958342, 0.1851252361506992, 0.40473944308180876, 0.09146548928232345, 0.9081940293756432, 0.46498973429777424, 0.6377242992934606, 0.9556782520273506, 0.8999310054748375, 0.4432443972054898, 0.4071189004109492, 0.9671007384382269, 0.4882946258503871, 0.6977032221165063, 0.9816587908643588, 0.9722506170082166, 0.3736677654952947, 0.10572159859712049, 0.5916920506180121, 0.49010455776276807, 0.5397907081261848, 0.5977137712462373, 0.026768920647683547, 0.76420971659877, 0.9501033254017723, 0.22740674811327333, 0.3738267907670587, 0.13438760982146336, 0.9231019103098823, 0.14617568818822324, 0.35032709602503886, 0.00010425704863470386, 0.3860613419754033, 0.03896574667874941, 0.5918133219078567, 0.29054972713576466, 0.5303715547905918, 0.21874856762676576, 0.9897547119795747, 0.883775221868033, 0.9379193985794214, 0.441475000209117, 0.20495931318141491, 0.07979394186738809, 0.08247241088106327, 0.4622173874615665, 0.22713960453947113, 0.8816985917037212, 0.37255319627556527, 0.758669164158041, 0.005883618915732525, 0.5706559058599769, 0.432479011117618, 0.2701731279224171, 0.6918763331803117, 0.7875240620254869, 0.7810311102420944, 0.9672770625818659, 0.972192678951707, 0.6430761074707063, 0.8913899424818665, 0.3985269205808113, 0.7114415269408474, 0.8929726580840076, 0.6138539717939764, 0.971996039693227, 0.5754185572119064, 0.4617370197263677, 0.8220576132039221, 0.46840299641644734, 0.7653221941722632, 0.5511491609405059, 0.11766380347055927, 0.5878603387560806, 0.18835231171767042, 0.31727465019953804, 0.5880580451494273, 0.2706452621191664, 0.015559339200972966, 0.15552372681124393, 0.3825080717529772, 0.1344658045469247, 0.23695951610840948, 0.2693208821649491, 0.22903945715638008, 0.9393838092323921, 0.03981581978107873, 0.37107618867596837, 0.10779645917562286, 0.2463579788160688, 0.18992947696644902, 0.6634831894496585, 0.8182224384495489, 0.9456009797995786, 0.44435067085588176, 0.8179208729224507, 0.1558872331697294, 0.696909798075791, 0.8489533719448041, 0.5214937140608304, 0.587019813751338, 0.38301653570309036, 0.13766841824749831, 0.9354783155971658, 0.6639057518303824, 0.8523530485239028, 0.537574539586378, 0.28686636238376817, 0.9808271346683308, 0.6297556104199964, 0.9476135045174736, 0.9517432891568709, 0.01289546222711846, 0.8044083386336214, 0.2630061512963273, 0.7808537821648875, 0.44529464009639774, 0.651779891831501, 0.9352819600174642, 0.7233734948296315, 0.0360211412383149, 0.46353955714500383, 0.6506131546117802, 0.02087838549770704, 0.08204045372946656, 0.5954659769341517, 0.4302975040535919, 0.645699541370331, 0.31072128962347434, 0.5887597719743392, 0.9997788776185685, 0.8739556690769028, 0.5255976122540655, 0.9885900412673647, 0.185437709916755, 0.8242691901288202, 0.3262298647798323, 0.48653459917835407, 0.539273573226871, 0.9405184830287914, 0.11803713692130868, 0.8958152833942525, 0.7034549633029905, 0.36306708438301927, 0.6330755988778876, 0.8018413452794797, 0.9399586054384077, 0.47871847737347606, 0.3320626290042459, 0.6321590295876438, 0.05564293022900202, 0.6397973033203808, 0.12049120897780363, 0.07047885473894477, 0.35222310173554217, 0.2961856108279819, 0.23771319631293153, 0.19667645785086996, 0.44248145897085567, 0.23477828668818312, 0.9764074459715215, 0.686218259603085, 0.1414828845971856, 0.7459205729955476, 0.6285087442630237, 0.8758579492727099, 0.5442000226146693, 0.5704551877799076, 0.8623879219317556, 0.9233558896997247, 0.17611350028057582, 0.7528966050081751, 0.19787757153133412, 0.5422045047574904, 0.6293012705678365, 0.5235584457217719, 0.4216519014159641, 0.33813338468848975, 0.9636298496134179, 0.0772966713018044, 0.09470784101825935, 0.803646895802345, 0.9263173776590983, 0.9482053473197718, 0.07149183437812012, 0.755623058477856, 0.059666829890566264, 0.12470854327102776, 0.005995609056931306, 0.7615323202920807, 0.4780113446006127, 0.7303361913099138, 0.19098282651823517, 0.7438503898351057, 0.04097050677712821, 0.35159740411753426, 0.1304363818980654, 0.8876147476726941, 0.2192102126944082, 0.6302894681214235, 0.5259266025739193, 0.740563161918141, 0.6924933800012811, 0.11651837079598248, 0.4072588714759646, 0.8664026906914968, 0.8414664700745436, 0.7684554842145659, 0.9468125068103483, 0.8314346801711929, 0.9221718437430098, 0.4565026027371233, 0.2252734072580358, 0.7518225934764646, 0.06493126619200096, 0.8587693922864086, 0.43370733607744794, 0.5947642435205023, 0.5001359839622512, 0.6244665728358416, 0.4375101869661471, 0.933017955203091, 0.7691045501814562, 0.03185828465364393, 0.7841162107990529, 0.9397788867966603, 0.9285445313758474, 0.2873911377528926, 0.1582308215010404, 0.3528593206424784, 0.8969807403435546, 0.15961892765809216, 0.500938624507304, 0.25524033434730375, 0.7450196762148895, 0.16899178333173426, 0.627224082769124, 0.38537657967604444, 0.6272319373564983, 0.20680570934495424, 0.637047047190805, 0.8985561715382764, 0.6809680983450062, 0.60348910678152, 0.9382351081059688, 0.9490136359341179, 0.5547941363765054, 0.7811593620685915, 0.8341544120997944, 0.8939159921612929, 0.01157999768324891, 0.2478395536102167, 0.07435663409043358, 0.7305586226962728, 0.093439825503004, 0.35951399902579184, 0.3637294934494002, 0.6827059507363797, 0.38383413048322956, 0.7172216125617987, 0.11169335651709011, 0.17632671887900253, 0.4782658018128103, 0.735943129947612, 0.11968134351516779, 0.47272382915645816, 0.16547813234486553, 0.826335755734342, 0.8043927128014225, 0.05803157515814883, 0.8368473812496005, 0.12442045785872113, 0.7706821548414025, 0.921575803911896, 0.7065860726607709, 0.40961728982302614, 0.9981428134649979, 0.9487171529440415, 0.18948264486320165, 0.8479680919147148, 0.7441461375499272, 0.13374916041537332, 0.3256854811576282, 0.6314952916401786, 0.6733706471372454, 0.8492988140484716, 0.05474661355861521, 0.47836596938843035, 0.7117727654852208, 0.6312958780712534, 0.7492389581568353, 0.8811731047660498, 0.692087969995804, 0.5851887281680144, 0.7735361922593009, 0.6993987329344977, 0.6208199063774194, 0.7209233872765415, 0.6591273037586955, 0.8246931904230033, 0.06676767346829648, 0.5676559572580238, 0.37397407200463983, 0.23808212024819397, 0.383802291625841, 0.6485351940768922, 0.2031986637698311, 0.017000615756823434, 0.46689561926875545, 0.3444805296139388, 0.445161989541085, 0.4590357988961471, 0.8644929946050339, 0.3597801641246623, 0.08200340188321964, 0.6253867039634471, 0.24080408062575387, 0.4749756645029979, 0.48515877179254585, 0.5462628035799457, 0.18464517189994623, 0.6562509578950677, 0.454637300057972, 0.7403198723314721, 0.27979898435756945, 0.5660699623202079, 0.593781209254491, 0.2019522052929048, 0.5354331643118151, 0.07980564318274008, 0.23250413787679358, 0.14504063010245738, 0.9422420447311981, 0.0637163807572263, 0.1716520295962698, 0.3705193103647648, 0.5779764484879781, 0.41543052088248, 0.34023171697182053, 0.1300177212291307, 0.12135218834109396, 0.33131569170391373, 0.20379984651569694, 0.38609439147359104, 0.19130420730945197, 0.6801060871028777, 0.1878890613796993],
        numberOfRandomNumbers = staticRandom.length;

    return {
        randomObservable: Rx.Observable.from(staticRandom),
        getRandom: function () {
            index += 1;
            if (index >= numberOfRandomNumbers) {
                index = 0;
            }
            return staticRandom[index];
        }
    };

}());