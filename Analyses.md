---
layout: page
title: AI-Powered Inventory and Quality Monitoring System
permalink: /Analyses/
---
1

22.11.2024

TED

UNIVERSITY

CMPE 491

Senior Project I

Project

Analysis ReportReport: AI Powered

Inventory and Quality Monitoring System

Project

Team Erdem Atak, Zeynep Bakanoğulları, İrem Su Gül

Advisor

Tansel Dökeroğlu

Jury

Members Eren Ulu, Fırat Akba

2

Table

Table ofof ContentsContents

1.1. IntroductionIntroduction …………………………………………………………………………………………………………33

2.2. CurrentCurrent SystemSystem …………………………………….……………………………………………….…………33

3.3. ProposedProposed SystemSystem …………………………………………….…………………………………………….44

3.1:3.1: OverviewOverview ……………………………………………………………………………………………………44--55

3.2:3.2: FunctionalFunctional RequirementsRequirements ………………………………………………………………55

3.2.1:3.2.1: StockStock TrackingTracking ModuleModule……………………….………………………. 55

3.2.2:3.2.2: QualityQuality MonitoringMonitoring Module……………………Module……………………55

3.2.3:3.2.3: DeteriorationDeterioration TrackingTracking ModuleModule……………….……………….66

3.2.4:3.2.4: ExpirationExpiration DateDate MonitoringMonitoring ModuleModule………….………….66

3.2.5:3.2.5: InventoryInventory ForecastingForecasting SystemSystem………………..………………..66

3.3:3.3: NonfunctionalNonfunctional RequirementsRequirements …………………………………………………………77

3.3.1:3.3.1: PerformancePerformance …………………………………….…………………………………….77

3.3.2:3.3.2: SecuritySecurity ………………………………………….………………………………………….77

3.3.3:3.3.3: ReliabilityReliability ………………………………………..………………………………………..77

3.3.4:3.3.4: UsabilityUsability ……………………………………………………………………………………88

3.3.5:3.3.5: MaintainabilityMaintainability ……………………………………………………………………....88

3.3.6:3.3.6: ScalabilityScalability ………………………………………..………………………………………..99

3.3.7:3.3.7: CompatibilityCompatibility …………………………………….…………………………………….99

3.4:3.4: PseudoPseudo RequirementsRequirements …………………………………………………………………………99

3.5:3.5: SystemSystem ModelsModels ……………………………………………………………………………………......1010

3.5.1:3.5.1: ScenariosScenarios ………………………………………………………………………………..1010--1111

3.5.2:3.5.2: UseUse CaseCase DiagramDiagram …………………………….…………………………….1212

3.5.3:3.5.3: ClassClass DiagramDiagram ………………………………….………………………………….1313

3.5.4:3.5.4: DynamicDynamic ModelsModels ………………………………..………………………………..1414

3.5.5:3.5.5: UserUser Interface:Interface: ScreenScreen MockMock--upsups ……………..……………..1155--1919

3.5.6:3.5.6: FeaturesFeatures ofof SystemSystem InterfaceInterface ModulesModules ………..………..2020--2121

4.4. GlossaryGlossary …………………………………………………………..…………………………………………………………..2222

5.5. ReferencesReferences ……………………………………………………….……………………………………………………….2323

3

1.

3.  IntroductionIntroduction
    
    The
    
    The AIAI--PoweredPowered InventoryInventory andand QualityQuality MonitoringMonitoring SystemSystem representsrepresents anan innovativeinnovative solutionsolution designeddesigned toto addressaddress criticalcritical challengeschallenges inin inventoryinventory managementmanagement andand qualityquality control,control, particularlyparticularly forfor businessesbusinesses handlinghandling perishableperishable goods.goods. ThisThis analysisanalysis documentdocument examinesexamines thethe systemsystem requirements,requirements, constraints,constraints, andand proposedproposed solutionssolutions basedbased onon thethe initialinitial projectproject specifications.specifications.
    
    The
    
    The systemsystem aimsaims toto revolutionizerevolutionize traditionaltraditional inventoryinventory managementmanagement byby incorporatingincorporating advancedadvanced technologiestechnologies suchsuch asas computercomputer visionvision andand machinemachine learninglearning toto automateautomate variousvarious aspectsaspects ofof stockstock trackingtracking andand qualityquality control.control. ThisThis analysisanalysis willwill detaildetail howhow thethe systemsystem willwill function,function, itsits requirements,requirements, andand thethe challengeschallenges itit aimsaims toto address.address.
    

9.  CurrentCurrent SystemSystem
    
    Currently,
    
    Currently, mostmost businessesbusinesses relyrely onon manualmanual processesprocesses forfor inventoryinventory managementmanagement andand qualityquality control,control, whichwhich presentspresents severalseveral challenges:challenges:
    
    •
    
    ManualManual stockstock trackingtracking leadingleading toto humanhuman errorerror
    
    •
    
    InefficientInefficient qualityquality monitoringmonitoring processesprocesses
    
    •
    
    DelayedDelayed detectiondetection ofof productproduct deteriorationdeterioration
    
    •
    
    ManualManual expirationexpiration datedate checkingchecking
    
    •
    
    ReactiveReactive ratherrather thanthan predictivepredictive inventoryinventory managementmanagement
    
    •
    
    TimeTime--consumingconsuming physicalphysical inventoryinventory countscounts
    
    •
    
    InconsistentInconsistent qualityquality assessmentassessment standardsstandards
    
    •
    
    LimitedLimited datadata collectioncollection forfor trendtrend analysisanalysis
    
    •
    
    HighHigh dependencydependency onon humanhuman judgmentjudgment forfor qualityquality assessmentassessment
    
    These
    
    These limitationslimitations resultresult in:in:
    
    •
    
    IncreasedIncreased productproduct wastewaste
    
    •
    
    HigherHigher operationaloperational costscosts
    
    •
    
    ReducedReduced efficiencyefficiency
    
    •
    
    InconsistentInconsistent qualityquality controlcontrol
    
    •
    
    PotentialPotential customercustomer dissatisfactiondissatisfaction
    
    •
    
    FinancialFinancial losseslosses duedue toto spoilagespoilage
    
    •
    
    InefficientInefficient resourceresource allocationallocation
    
    4
    

15.  ProposedProposed SystemSystem
    
    3.1
    
    3.1 OverviewOverview
    
    The
    
    The proposedproposed systemsystem automatesautomates inventoryinventory managementmanagement andand qualityquality monitoringmonitoring usingusing imageimage recognitionrecognition andand machinemachine learninglearning models.models. KeyKey modulesmodules includeinclude stockstock tracking,tracking, qualityquality assessment,assessment, expirationexpiration monitoring,monitoring, andand inventoryinventory forecasting.forecasting. TheThe systemsystem ensuresensures accuracy,accuracy, reducesreduces manualmanual intervention,intervention, andand optimizesoptimizes stockstock managementmanagement decisions.decisions.TheThe proposedproposed systemsystem willwill integrateintegrate severalseveral keykey technologiestechnologies toto createcreate aa comprehensivecomprehensive solution:solution:
    

18.  QualityQuality ControlControl SystemSystem
    
    ◦
    
    ComputerComputer visionvision--basedbased defectdefect detectiondetection
    
    ◦
    
    AutomatedAutomated updates to reflect changes in the inventory
    
    ◦
    
    VisualVisual inspectioninspection usingusing imageimage recognitionrecognition toto detectdetect defects.defects.
    
    ◦
    
    AssessingAssessing productproduct deteriorationdeterioration levelslevels throughthrough machinemachine learninglearning
    
    ◦
    
    ClassificationClassification ofof productproduct conditionsconditions (e.g.,(e.g., normal,normal, deteriorated,deteriorated, defective)defective)
    

21.  StockStock TrackingTracking SystemSystem
    
    ◦
    
    Realeal--timetime monitoringmonitoring of stock levels
    
    ◦
    
    IntegrationIntegration withwith existingexisting inventoryinventory databasesdatabases
    
    ◦
    
    ContinuousContinuous stockstock levellevel updatesupdates
    

24.  ExpirationExpiration ManagementManagement
    
    ◦
    
    AutomatedAutomated datedate recognitionrecognition
    
    ◦
    
    ProactiveProactive expirationexpiration alertsalerts
    
    ◦
    
    SystematicSystematic trackingtracking
    

27.  Inventory ForecastingForecasting SystemSystem
    
    ◦
    
    Time-series salesales datadata analysisanalysis
    
    ◦
    
    PredictivePredictive inventoryinventory managementmanagement
    
    ◦
    
    ForecastingForecasting futurefuture stockstock requirementsrequirements toto avoidavoid underunder-- oror overover--stocking.stocking.
    

30.  UserUser InterfaceInterface System
    
    ◦
    
    AA webweb--basedbased dashboarddashboard providing:providing:
    
    5
    
    ◦
    
    SummarySummary ofof inventoryinventory levels.levels.
    
    ◦
    
    QualityQuality alertsalerts andand forecasts.forecasts.
    
    ◦
    
    DetailedDetailed reports.reports.
    
    3.2
    
    3.2 FunctionalFunctional RequirementsRequirements
    
    3.2.13.2.1 StockStock TrackingTracking ModuleModule
    

33.  Real-time Inventory Monitoring
    
    ◦
    
    AutomatedAutomated stockstock levellevel trackingtracking
    
    ◦
    
    ProductProduct identificationidentification andand countingcounting
    
    ◦
    
    StockStock movementmovement trackingtracking
    
    ◦
    
    InventoryInventory reconciliationreconciliation
    
    ◦
    
    AlertAlert generationgeneration forfor lowlow stockstock levelslevels
    

36.  DatabaseDatabase IntegrationIntegration
    
    ◦
    
    RealReal--timetime synchronizationsynchronization
    
    ◦
    
    HistoricalHistorical datadata maintenancemaintenance
    
    ◦
    
    DataData backupbackup andand recoveryrecovery
    
    3.2.2 Quality Monitoring Module
    

39.  DefectDefect DetectionDetection
    
    ◦
    
    VisualVisual analysisanalysis ofof productsproducts
    
    ◦
    
    AutomatedAutomated classificationclassification
    
    ◦
    
    DefectDefect categorizationcategorization
    

42.  ImageImage ProcessingProcessing
    
    ◦
    
    Processing of the image to be compatible with machine learning model
    
    ◦
    
    MultipleMultiple angleangle analysisanalysis if the images are available
    
    ◦
    
    ImageImage storagestorage
    
    6
    
    3.2.3
    
    3.2.3 DeteriorationDeterioration LevelLevel TrackingTracking
    

45.  MLML--BasedBased Model
    
    ◦
    
    Monitoring of detention based on images
    
    ◦
    
    AssessingAssessing productproduct deteriorationdeterioration levelslevels throughthrough machinemachine learning.learning.
    
    ◦
    
    ProgressiveProgressive deteriorationdeterioration trackingtracking
    

48.  Alert System
    
    ◦
    
    Generating notifications on the system nearing critical detonation levels detected by ML model
    
    ◦
    
    AutomatedAutomated reportingreporting
    
    3.2.43.2.4 ExpirationExpiration DateDate MonitoringMonitoring
    

51.  DateDate RecognitionRecognition
    
    ◦
    
    OCROCR--basedbased datedate extractionextraction
    
    ◦
    
    FormatFormat standardizationstandardization
    
    ◦
    
    BatchBatch processingprocessing capabilitycapability
    
    ◦
    
    VerificationVerification systemsystem
    

54.  Alert Management
    
    ◦
    
    AutomatedAutomated alertsalerts forfor productsproducts nearingnearing expiration.expiration.
    
    ◦
    
    ReportingReporting featuresfeatures forfor proactiveproactive decisiondecision--making.making.
    
    ◦
    
    ActionAction recommendationrecommendation
    
    3.2.53.2.5 InventoryInventory ForecastingForecasting System
    

57.  DataData AnalysisAnalysis
    
    ◦
    
    HistoricalHistorical salessales analysisanalysis
    
    ◦
    
    SeasonalSeasonal trendtrend identificationidentification
    
    ◦
    
    DemandDemand patternpattern recognitionrecognition
    

60.  PredictionPrediction SystemSystem
    
    ◦
    
    StockStock levellevel optimizationoptimization
    
    ◦
    
    ForecastingForecasting futurefuture stockstock requirementsrequirements toto avoidavoid underunder-- oror overover--stockingstocking
    
    7
    
    3.3
    
    3.3 NonfunctionalNonfunctional RequirementsRequirements
    
    3.3.13.3.1 PerformancePerformance
    
    •
    
    SystemSystem mustmust processprocess singlesingle productproduct imageimage analysisanalysis withinwithin 10 secondsseconds
    
    •
    
    DashboardDashboard mustmust loadload withinwithin 1.51.5 secondsseconds withwith upup toto 10,00010,000 inventoryinventory itemsitems
    
    •
    
    SystemSystem mustmust supportsupport minimumminimum 100100 concurrentconcurrent usersusers withoutwithout performanceperformance degradationdegradation
    
    •
    
    DatabaseDatabase queriesqueries mustmust completecomplete withinwithin 5 seconds forfor standardstandard operationsoperations
    
    •
    
    ImageImage processingprocessing pipelinepipeline mustmust handlehandle minimumminimum 1 imagesimages perper minuteminute
    
    •
    
    SystemSystem uptimeuptime ofof 99.9%99.9% measuredmeasured monthlymonthly (maximum(maximum 43.243.2 minutesminutes downtimedowntime perper month)month)
    
    •
    
    MaximumMaximum memorymemory usageusage mustmust notnot exceedexceed 8GB8GB underunder fullfull loadload
    
    •
    
    APIAPI endpointsendpoints mustmust respondrespond withinwithin 200ms200ms forfor GETGET requestsrequests andand 500ms500ms forfor POSTPOST requestsrequests
    
    3.3.23.3.2 SecuritySecurity
    
    •
    
    ImplementationImplementation ofof AESAES--256256 encryptionencryption forfor datadata atat restrest
    
    •
    
    PasswordPassword requirements:requirements: minimumminimum 6 characters,characters, mustmust includeinclude uppercase,uppercase, lowercase,lowercase, numbers,numbers, andand specialspecial characterscharacters
    
    •
    
    FailedFailed loginlogin attemptsattempts limitedlimited toto 55 withinwithin 1515 minutesminutes beforebefore temporarytemporary accountaccount lockoutlockout
    
    •
    
    AllAll systemsystem actionsactions mustmust bebe loggedlogged withwith timestamp,timestamp, useruser ID,ID, andand IPIP addressaddress
    
    •
    
    DatabaseDatabase backupsbackups everyevery 66 hourshours withwith 3030--dayday retentionretention periodperiod
    
    3.3.33.3.3 ReliabilityReliability
    
    •
    
    SystemSystem recoveryrecovery timetime (RTO)(RTO) mustmust notnot exceedexceed 44 hourshours
    
    •
    
    AutomatedAutomated failoverfailover mechanismmechanism mustmust activateactivate withinwithin 3030 secondsseconds ofof primaryprimary systemsystem failurefailure
    
    •
    
    DataData consistencyconsistency checkschecks mustmust runrun everyevery 1515 minutesminutes
    
    •
    
    ErrorError logslogs mustmust bebe maintainedmaintained forfor minimumminimum 9090 daysdays
    
    •
    
    SystemSystem mustmust handlehandle minimumminimum 10,00010,000 transactionstransactions perper hourhour
    
    •
    
    AutomatedAutomated backupbackup systemsystem with:with:
    
    ◦
    
    HourlyHourly incrementalincremental backupsbackups
    
    ◦
    
    DailyDaily fullfull backupsbackups
    
    ◦
    
    WeeklyWeekly offoff--sitesite backupsbackups
    
    ◦
    
    MonthlyMonthly archivearchive backupsbackups withwith 11--yearyear retentionretention
    
    •
    
    ErrorError reportingreporting withinwithin a day
    
    8
    
    3.3.43.3.4 UsabilityUsability
    
    •
    
    MaximumMaximum 5 clicksclicks toto reachreach anyany majormajor functionfunction fromfrom thethe mainmain dashboarddashboard
    
    •
    
    AllAll criticalcritical functionsfunctions mustmust bebe accessibleaccessible viavia keyboardkeyboard shortcutsshortcuts
    
    •
    
    SystemSystem responseresponse feedbackfeedback withinwithin 500msms ofof useruser actionaction
    
    •
    
    ErrorError messagesmessages mustmust bebe specificspecific andand suggestsuggest correctivecorrective actionaction
    
    •
    
    SearchSearch resultsresults mustmust appearappear withinwithin 11 secondseconds
    
    •
    
    UIUI mustmust supportsupport minimumminimum screenscreen resolutionresolution ofof 1366x7681366x768
    
    •
    
    FormForm completioncompletion timetime mustmust notnot exceedexceed 11 minuteminute forfor standardstandard operationsoperations
    
    •
    
    SystemSystem mustmust supportsupport thethe followingfollowing browsers:browsers:
    
    ◦
    
    Chrome
    
    ◦
    
    FirefoxFirefox
    
    ◦
    
    Safari
    
    ◦
    
    EdgeEdge
    
    •
    
    InterfaceInterface texttext mustmust maintainmaintain minimumminimum contrastcontrast ratioratio ofof 4.5:14.5:1
    
    •
    
    AllAll interactiveinteractive elementselements mustmust havehave minimumminimum touchtouch targettarget sizesize ofof 44x4444x44 pixelspixels
    
    3.3.53.3.5 MaintainabilityMaintainability
    
    •
    
    CodeCode documentationdocumentation coveragecoverage minimumminimum 80%80%
    
    •
    
    AutomatedAutomated testtest coveragecoverage minimumminimum 85%85%
    
    •
    
    MaximumMaximum bugbug resolutionresolution time:time:
    
    ◦
    
    Critical:Critical: 44 hourshours
    
    ◦
    
    High:High: 2424 hourshours
    
    ◦
    
    Medium:Medium: 7272 hourshours
    
    ◦
    
    Low:Low: 11 weekweek
    
    •
    
    SystemSystem logslogs mustmust bebe structuredstructured inin JSONJSON formatformat
    
    •
    
    APIAPI versioningversioning systemsystem withwith supportsupport forfor minimumminimum 22 previousprevious versionsversions
    
    9
    
    3.3.63.3.6 ScalabilityScalability
    
    •
    
    SystemSystem mustmust scalescale horizontallyhorizontally toto handlehandle 100%% increaseincrease inin loadload
    
    •
    
    DatabaseDatabase mustmust supportsupport minimumminimum 100GB ofof datadata withwith queryquery performanceperformance degradationdegradation notnot exceedingexceeding 10%10%
    
    •
    
    StorageStorage systemsystem mustmust supportsupport 50%50% annualannual growthgrowth inin datadata volumevolume
    
    •
    
    MessageMessage queuequeue mustmust handlehandle minimumminimum 10001000 messagesmessages perper secondsecond
    
    3.3.73.3.7 CompatibilityCompatibility
    
    •
    
    RESTREST APIAPI mustmust supportsupport JSONJSON format
    
    •
    
    DataData exportexport inin CSV,CSV, JSON,JSON, andand PDFPDF formatsformats based on the user need
    
    •
    
    SupportSupport forfor standardstandard imageimage formats:formats:
    
    ◦
    
    JPEGJPEG (up(up toto 10MB)
    
    ◦
    
    PNGPNG (up(up toto 20MB)
    
    •
    
    DatabaseDatabase compatibilitycompatibility withwith PostgreSQLPostgreSQL 1313
    
    3.4 Pseudo Requirements
    

66.  HardwareHardware RequirementsRequirements::
    
    •• CCamerasameras forfor imageimage capturecapture fromfrom differentdifferent angles.angles.
    
    •• SufficientSufficient storagestorage forfor historicalhistorical data.data.
    

72.  EmployeeEmployee AdaptationAdaptation::
    
    •• UserUser--friendlyfriendly interfacesinterfaces toto minimizeminimize resistanceresistance fromfrom staffstaff toto learnlearn thethe systemsystem ..
    
    •• TrainingTraining sessionssessions toto ensureensure easyeasy andand smoothsmooth adoption.adoption.
    

78.  EthicalEthical RequirementsRequirements
    
    •• ACMACM codecode ofof ethicsethics andand IEEEIEEE codecode ofof ethicsethics willwill bebe followed.followed.
    
    10
    
    3.5
    
    3.5 SystemSystem ModelsModels
    
    3.5.1 Scenarios
    
    ScenarioScenario 1:1: InventoryInventory StockStock UpdateUpdate
    
    •
    
    Actor:Actor: InventoryInventory ManagerManager
    
    •
    
    Goal: UpdateUpdate stockstock levelslevels afterafter aa newnew shipmentshipment arrives.arrives.
    
    •
    
    Preconditions:Preconditions: TheThe shipmentshipment hashas beenbeen loggedlogged inin thethe system,system, andand imagesimages ofof productsproducts areare available.available.
    
    •
    
    Steps:Steps:
    

81.  InventoryInventory ManagerManager logslogs intointo thethe systemsystem viavia thethe dashboard.dashboard.

84.  SelectsSelects "Stock"Stock Tracking"Tracking" fromfrom thethe menu.menu.

87.  UploadsUploads productproduct imagesimages viavia thethe stockstock updateupdate interface.interface.

90.  SystemSystem identifiesidentifies andand categorizescategorizes productsproducts usingusing imageimage recognition.recognition.

93.  UpdatedUpdated stockstock levelslevels areare reflectedreflected inin thethe dashboard.dashboard.
    
    •
    
    Postconditions:Postconditions: StockStock levelslevels areare updated,updated, andand alertsalerts forfor criticalcritical stockstock areare resolvedresolved ifif applicable.applicable.
    
    ScenarioScenario 2:2: QualityQuality CheckCheck AlertAlert
    
    •
    
    Actor:Actor: QualityQuality ControlControl SpecialistSpecialist
    
    •
    
    Goal: IdentifyIdentify andand addressaddress defectivedefective products.products.
    
    •
    
    Preconditions:Preconditions: SystemSystem hashas processedprocessed imagesimages ofof productsproducts andand flaggedflagged defects.defects.
    
    •
    
    Steps:Steps:
    

96.  QualityQuality ControlControl SpecialistSpecialist accessesaccesses thethe "Quality"Quality Alerts"Alerts" sectionsection ofof thethe dashboard.dashboard.

99.  ViewsViews flaggedflagged productsproducts andand defectdefect detailsdetails (e.g.,(e.g., typetype andand locationlocation ofof defect).defect).

102.  MarksMarks itemsitems forfor removalremoval oror sendssends themthem forfor furtherfurther inspection.inspection.

105.  UpdatesUpdates thethe statusstatus inin thethe systemsystem toto reflectreflect thethe actionaction taken.taken.
    
    •
    
    Postconditions:Postconditions: DefectiveDefective productsproducts areare removedremoved oror addressed,addressed, andand thethe systemsystem recordsrecords thethe action.action.
    
    Scenario
    
    Scenario 3:3: ExpirationExpiration DateDate NotificationNotification
    
    •
    
    Actor:Actor: StoreStore SupervisorSupervisor
    
    •
    
    Goal: TakeTake proactiveproactive actionsactions onon productsproducts nearingnearing expiration.expiration.
    
    11
    
    •
    
    Preconditions:Preconditions: SystemSystem hashas scannedscanned expirationexpiration datesdates andand flaggedflagged itemsitems nearingnearing theirtheir expiration.expiration.
    
    •
    
    Steps:Steps:
    

108.  SupervisorSupervisor receivesreceives anan automatedautomated expirationexpiration alertalert onon thethe dashboard.dashboard.

111.  NavigatesNavigates toto thethe "Expiration"Expiration Management"Management" module.module.

114.  ReviewsReviews thethe listlist ofof productsproducts nearingnearing expirationexpiration andand associatedassociated details.details.

117.  DecidesDecides onon actionsactions suchsuch asas discountsdiscounts oror removalremoval fromfrom inventory.inventory.

120.  UpdatesUpdates productproduct statusstatus inin thethe system.system.
    
    •
    
    Postconditions:Postconditions: ProductsProducts nearingnearing expirationexpiration areare managedmanaged appropriately,appropriately, minimizingminimizing waste.waste.
    
    ScenarioScenario 4:4: ForecastingForecasting InventoryInventory NeedsNeeds
    
    •
    
    Actor:Actor: SupplySupply ChainChain AnalystAnalyst
    
    •
    
    Goal: PlanPlan inventoryinventory ordersorders basedbased onon predictivepredictive data.data.
    
    •
    
    Preconditions:Preconditions: HistoricalHistorical salessales datadata andand seasonalseasonal trendstrends areare available.available.
    
    •
    
    Steps:Steps:
    

123.  AnalystAnalyst accessesaccesses thethe "Forecast"Forecast Insights"Insights" sectionsection onon thethe dashboard.dashboard.

126.  ViewsViews demanddemand forecastsforecasts forfor thethe upcomingupcoming weeksweeks oror months.months.

129.  DownloadsDownloads reportsreports withwith recommendationsrecommendations forfor reorderreorder quantities.quantities.

132.  CommunicatesCommunicates recommendationsrecommendations toto procurementprocurement teams.teams.
    
    •
    
    Postconditions:Postconditions: InventoryInventory levelslevels areare optimizedoptimized toto meetmeet futurefuture demand.demand.
    
    ScenarioScenario 5:5: SystemSystem DowntimeDowntime andand RecoveryRecovery
    
    •
    
    Actor:Actor: SystemSystem AdministratorAdministrator
    
    •
    
    Goal: EnsureEnsure minimalminimal disruptiondisruption duringduring downtime.downtime.
    
    •
    
    Preconditions:Preconditions: SystemSystem experiencesexperiences anan unexpectedunexpected failure.failure.
    
    •
    
    Steps:Steps:
    

135.  AdministratorAdministrator isis alertedalerted byby thethe automatedautomated failoverfailover mechanism.mechanism.

138.  LogsLogs intointo thethe backupbackup systemsystem toto monitormonitor ongoingongoing operations.operations.

141.  InvestigatesInvestigates rootroot causecause usingusing errorerror logs.logs.

144.  RestoresRestores thethe primaryprimary systemsystem withinwithin thethe specifiedspecified time.
    
    •
    
    Postconditions:Postconditions: SystemSystem returnsreturns toto normalnormal operationsoperations withwith minimalminimal downtimedowntime andand datadata loss.loss.
    
    12
    
    3.5.2 Use Case Diagram
    
    Use Case Diagram
    
    13
    
    3.5.3 Class Diagram
    
    Class Diagram
    
    14
    
    3.5.4 Dynamic Models
    
    Sequence Diagram 2
    
    15
    
    3
    
    3.5.5.5.5 UserUser InterfaceInterface -- NavigatiNavigationalonal PathsPaths andand ScreenScreen MockMock--upsups
    
    Main Dashboard 1
    
    Main Dashboard 2
    
    16
    
    Quality Control 1
    
    Quality Control 2
    
    17
    
    Forecast 1
    
    Forecast 2
    
    Forecast 3
    
    18
    
    Stock Management
    
    Expiration Tracking
    
    19
    
    Notifications
    
    20
    
    3.5.6 Features of System Interface Modules
    
    Main
    
    Main DashboardDashboard
    
    On the Main Page:
    
    •
    
    StockStock levelslevels overviewoverview
    
    •
    
    QualityQuality alertsalerts sectionsection
    
    •
    
    ExpirationExpiration warningswarnings
    
    •
    
    ForecastForecast insightsinsights
    
    •
    
    Menu selection on the left side of the dashboard
    
    •
    
    Notifications on the toğ right of the dashboard
    
    Stock ManagementManagement
    
    •
    
    StockStock levellevel detailsdetails
    
    •
    
    ProductProduct categorizationcategorization
    
    •
    
    Add new items button
    
    •
    
    Filtering option
    
    Quality
    
    Quality ControlControl
    
    •
    
    Total number of inspections
    
    •
    
    Failed number of inspections
    
    •
    
    Pass rate
    
    •
    
    Average response time of the inspection
    
    •
    
    DefectDefect detectiondetection resultsresults
    
    •
    
    DeteriorationDeterioration trackingtracking
    
    •
    
    Alert management
    
    •
    
    Filtering option
    
    •
    
    Adding new item to be inspected option
    
    •
    
    Exporting feature
    
    Expiration Tracking
    
    •
    
    Total expiring items
    
    •
    
    Weekly expiring items
    
    •
    
    Critical expiring items
    
    •
    
    Filtering option
    
    21
    
    Forecasting Module
    
    •
    
    Total projected sale
    
    •
    
    Total stock level
    
    •
    
    Estimated turn-over
    
    •
    
    Stock-out risked items
    
    •
    
    Sales forecast graph
    
    •
    
    Inventory projection graph
    
    Reports
    
    Reports
    
    •
    
    DataData visualizationvisualization
    
    •
    
    ExportExport feature
    
    •
    
    Future forecast with time-series analysis of sales data
    
    Notifications
    
    •
    
    Quality check notification
    
    •
    
    Critical expiring items notifications
    
    •
    
    Inventory notifications
    
    •
    
    Low stock alerts
    
    •
    
    Marked as read and clear features
    
    22
    

150.  GlossaryGlossary
    
    •
    
    CNNCNN:: ConvolutionalConvolutional NeuralNeural NetworkNetwork
    
    •
    
    OCROCR:: OpticalOptical CharacterCharacter RecognitionRecognition
    
    •
    
    MLML:: MachineMachine LearningLearning
    
    •
    
    MB: Megabyte: a size unit
    
    •
    
    RTO: System Recovery Time
    
    •
    
    API:: ApplicationApplication ProgrammingProgramming InterfaceInterface
    
    •
    
    SLA:: ServiceService LevelLevel AgreementAgreement
    
    •
    
    GDPRGDPR:: GeneralGeneral DataData ProtectionProtection RegulationRegulation
    
    •
    
    UI:: UserUser InterfaceInterface
    
    •
    
    PostgreSQL:: OpenOpen--sourcesource relationalrelational databasedatabase
    
    •
    
    NoSQL:: NonNon--relationalrelational databasedatabase
    
    •
    
    ReactReact:: JavaScriptJavaScript librarylibrary forfor buildingbuilding useruser interfacesinterfaces
    
    •
    
    PyTorchPyTorch:: MachineMachine learninglearning frameworkframework
    
    •
    
    Python: Programming language
    
    •
    
    ClassClass Diagram:Diagram:
    
    •
    
    RepresentsRepresents thethe structurestructure ofof aa system.system.
    
    •
    
    ShowsShows classes,classes, theirtheir attributes,attributes, methods,methods, andand thethe relationshipsrelationships (e.g.,(e.g., inheritance,inheritance, association)association) betweenbetween classes.classes.
    
    •
    
    Example:Example: AA PersonPerson classclass mightmight havehave attributesattributes likelike namename andand ageage andand methodsmethods likelike speak()speak() oror walk().walk().
    
    •
    
    SequenceSequence Diagram:Diagram:
    
    •
    
    RepresentsRepresents thethe interactioninteraction betweenbetween objectsobjects inin aa specificspecific sequencesequence overover time.time.
    
    •
    
    ShowsShows objectsobjects andand thethe messagesmessages exchangedexchanged toto completecomplete aa processprocess oror useuse case.case.
    
    •
    
    Example:Example: AA loginlogin processprocess showingshowing howhow aa UserUser sendssends credentialscredentials toto AuthService,AuthService, whichwhich verifiesverifies themthem andand responds.responds.
    
    •
    
    UseUse CaseCase Diagram:Diagram:
    
    •
    
    RepresentsRepresents thethe functionalitiesfunctionalities ofof aa system.system.
    
    •
    
    ShowsShows actorsactors (users(users oror externalexternal systems)systems) andand theirtheir interactionsinteractions withwith useuse casescases (system(system functionalities).functionalities).
    
    •
    
    Example:Example: AnAn onlineonline shoppingshopping systemsystem mightmight havehave useuse casescases likelike BrowseBrowse Products,Products, AddAdd toto Cart,Cart, andand Checkout,Checkout, withwith CustomerCustomer asas anan actor.actor.
    
    23
    

156.  ReferencesReferences
    
    •
    
    ProjectProject ProposalProposal DocumentDocument (CMPE491\_Project\_Proposal.pdf)(CMPE491\_Project\_Proposal.pdf)
    
    •
    
    ProjectProject SpecificationSpecification ReportReport--2.pdf2.pdf
    
    •
    
    IEEEIEEE CodeCode ofof EthicsEthics (([https://www.ieee.org/about/corporate/governance/p7https://www.ieee.org/about/corporate/governance/p7--8.html8.html](https://www.ieee.org/about/corporate/governance/p7https://www.ieee.org/about/corporate/governance/p7--8.html8.html))
    
    •
    
    ACMACM CodeCode ofof EthicsEthics (([https://www.acm.org/codehttps://www.acm.org/code--ofof--ethicsethics](https://www.acm.org/codehttps://www.acm.org/code--ofof--ethicsethics))
