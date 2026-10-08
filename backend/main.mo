import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Use data migration pattern with persistent state!

actor {
  type AppRole = {
    #Farmer;
    #Buyer;
    #Transporter;
  };

  public type UserProfile = {
    name : Text;
    contact : Text;
    location : Text;
    appRole : AppRole;
  };

  public type ListingFilterCriteria = {
    cropType : ?Text;
    location : ?Text;
    minReadinessScore : ?Float;
    qualityCertificateRequired : ?Bool;
  };

  public type HarvestListing = {
    id : Nat;
    farmer : Principal;
    cropType : Text;
    quantity : Nat;
    harvestDate : Time.Time;
    location : Text;
    readinessScore : Float;
    qualityCertificate : Bool;
    daysPassed : Nat;
    totalGrowthCycle : Nat;
    // New persistent field for crop analysis
    diagnosis : ?CropAnalysisReport;
  };

  public type Commitment = {
    id : Nat;
    buyer : Principal;
    listingId : Nat;
    quantity : Nat;
    price : Nat;
  };

  public type VehicleType = {
    #Truck;
    #Van;
    #Bike;
    #Other : Text;
  };

  public type TransportOffer = {
    transporter : Principal;
    listingId : Nat;
    commitmentId : Nat;
    vehicleType : VehicleType;
    loadCapacity : Nat;
    routeStart : Text;
    routeEnd : Text;
    accepted : Bool;
    currentLocation : Text;
    estimatedDeliveryTime : Text;
    trackingStatus : Text;
  };

  public type BuyerDemand = {
    id : Nat;
    buyerId : Principal;
    cropType : Text;
    quantity : Nat;
    pricePerKg : Nat;
    destinationSupply : Text;
    createdAt : Time.Time;
    status : Text;
    linkedListing : ?Nat;
  };

  public type CropReadinessData = {
    daysPassed : Nat;
    totalGrowthCycle : Nat;
    cropType : Text;
    location : Text;
    farmerAssessmentScore : Float;
  };

  public type PredictYieldResult = {
    predictedYield : Float;
    predictedPrice : Float;
  };

  public type CropMaturityAnalysis = {
    readinessScore : Float;
  };

  public type RouteLocation = {
    location : Text;
    quantity : Nat;
  };

  public type OptimizedRoute = {
    pickupLocations : [RouteLocation];
    deliveryLocations : [RouteLocation];
    distance : Float;
    costSavings : Float;
  };

  public type LogisticsOptimizationResult = {
    optimizedRoutes : [OptimizedRoute];
    overallDistance : Float;
    overallCostSavings : Float;
  };

  public type ParsedHarvestData = {
    cropType : Text;
    quantity : Nat;
    harvestDate : Int;
    location : Text;
  };

  // Persistent report
  public type CropAnalysisReport = {
    harvestReadinessScore : Float;
    qualityGrade : {
      #Premium;
      #Standard;
      #Reject;
    };
    healthFactors : {
      pestDetection : Bool;
      diseases : [Disease];
      nutrientDeficiencies : [NutrientDeficiency];
    };
  };

  public type Disease = {
    name : Text;
    severity : Int;
  };

  public type NutrientDeficiency = {
    name : Text;
    impact : Int;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  var nextListingId : Nat = 0;
  var nextCommitmentId : Nat = 0;
  var nextBuyerDemandId : Nat = 0;
  var nextRouteId : Nat = 0;
  let userProfiles = Map.empty<Principal, UserProfile>();
  let listingMap = Map.empty<Nat, HarvestListing>();
  let commitmentMap = Map.empty<Nat, List.List<Commitment>>();
  let transportMap = Map.empty<Nat, List.List<TransportOffer>>();
  let buyerDemandsMap = Map.empty<Nat, BuyerDemand>();
  let routeMap = Map.empty<Principal, [OptimizedRoute]>();

  let historicalData = Map.empty<Nat, CropReadinessData>();
  var currentHistoricalId = 0;

  private func hasAppRole(caller : Principal, requiredRole : AppRole) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.appRole == requiredRole };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  func predictCropReadiness(input : CropReadinessData) : Float {
    let historicalDataArray = historicalData.toArray();

    var totalSimilarScore : Float = 0.0;
    var similarCount : Nat = 0;

    for ((_, record) in historicalDataArray.values()) {
      if (record.cropType == input.cropType and record.location == input.location) {
        totalSimilarScore += record.farmerAssessmentScore;
        similarCount += 1;
      };
    };

    if (similarCount > 0) {
      totalSimilarScore / similarCount.toFloat();
    } else {
      60.0;
    };
  };

  public shared ({ caller }) func calculateReadinessScore(
    daysPassed : Nat,
    totalGrowthCycle : Nat,
    cropType : Text,
    location : Text,
    farmerAssessmentScore : Float,
  ) : async Float {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to calculate readiness score");
    };

    if (not hasAppRole(caller, #Farmer)) {
      Runtime.trap("Unauthorized: Only farmers can calculate readiness scores");
    };

    let inputData = {
      daysPassed;
      totalGrowthCycle;
      cropType;
      location;
      farmerAssessmentScore;
    };

    let mlPrediction = predictCropReadiness(inputData);

    if (totalGrowthCycle > 0) {
      let score = (((daysPassed.toInt() * 50) / totalGrowthCycle).toFloat() + (farmerAssessmentScore * 0.30) + (mlPrediction * 0.20));
      Float.min(score, 100.0);
    } else {
      Float.min(farmerAssessmentScore * 0.30 + mlPrediction * 0.20, 100.0);
    };
  };

  public shared ({ caller }) func createHarvestListing(
    cropType : Text,
    quantity : Nat,
    harvestDate : Time.Time,
    location : Text,
    readinessScore : Float,
    qualityCertificate : Bool,
    daysPassed : Nat,
    totalGrowthCycle : Nat,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to create a listing");
    };

    if (not hasAppRole(caller, #Farmer)) {
      Runtime.trap("Unauthorized: Only farmers can create harvest listings");
    };

    let historicalRecord : CropReadinessData = {
      daysPassed;
      totalGrowthCycle;
      cropType;
      location;
      farmerAssessmentScore = readinessScore;
    };
    historicalData.add(currentHistoricalId, historicalRecord);
    currentHistoricalId += 1;

    let actualReadinessScore = await calculateReadinessScore(
      daysPassed,
      totalGrowthCycle,
      cropType,
      location,
      readinessScore,
    );

    let listingId = nextListingId;
    let newListing = {
      id = listingId;
      farmer = caller;
      cropType;
      quantity;
      harvestDate;
      location;
      readinessScore = actualReadinessScore;
      qualityCertificate;
      daysPassed;
      totalGrowthCycle;
      diagnosis = null;
    };
    listingMap.add(listingId, newListing);
    nextListingId += 1;
    listingId;
  };

  public shared ({ caller }) func makeCommitment(listingId : Nat, quantity : Nat, price : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to make a commitment");
    };

    if (not hasAppRole(caller, #Buyer)) {
      Runtime.trap("Unauthorized: Only buyers can make commitments");
    };

    switch (listingMap.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (listing.farmer == caller) {
          Runtime.trap("Cannot make commitment to your own listing");
        };

        let commitmentId = nextCommitmentId;
        let newCommitment = {
          id = commitmentId;
          buyer = caller;
          listingId;
          quantity;
          price;
        };

        let commitments = switch (commitmentMap.get(listingId)) {
          case (null) { List.empty<Commitment>() };
          case (?existing) { existing };
        };

        commitments.add(newCommitment);
        commitmentMap.add(listingId, commitments);
        nextCommitmentId += 1;
        commitmentId;
      };
    };
  };

  public shared ({ caller }) func makeTransportOffer(
    listingId : Nat,
    vehicleType : VehicleType,
    loadCapacity : Nat,
    routeStart : Text,
    routeEnd : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to make a transport offer");
    };

    if (not hasAppRole(caller, #Transporter)) {
      Runtime.trap("Unauthorized: Only transporters can make transport offers");
    };

    switch (listingMap.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?_) {
        let newOffer = {
          transporter = caller;
          listingId;
          commitmentId = 0;
          vehicleType;
          loadCapacity;
          routeStart;
          routeEnd;
          accepted = false;
          currentLocation = "";
          estimatedDeliveryTime = "";
          trackingStatus = "Pending";
        };

        let offers = switch (transportMap.get(listingId)) {
          case (null) { List.empty<TransportOffer>() };
          case (?existing) { existing };
        };

        offers.add(newOffer);
        transportMap.add(listingId, offers);
      };
    };
  };

  public shared ({ caller }) func acceptTransportOffer(listingId : Nat, transporter : Principal, commitmentId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to accept transport offers");
    };

    if (not hasAppRole(caller, #Farmer)) {
      Runtime.trap("Unauthorized: Only farmers can accept transport offers");
    };

    switch (listingMap.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (listing.farmer != caller) {
          Runtime.trap("Unauthorized: Only the listing owner can accept offers");
        };

        var commitmentExists = false;
        switch (commitmentMap.get(listingId)) {
          case (null) { };
          case (?commitments) {
            commitmentExists := commitments.any(
              func(commitment : Commitment) : Bool {
                commitment.id == commitmentId and commitment.listingId == listingId;
              }
            );
          };
        };

        if (not commitmentExists) {
          Runtime.trap("Invalid commitment: Commitment does not exist for this listing");
        };

        switch (transportMap.get(listingId)) {
          case (null) { Runtime.trap("No transport offers found for this listing") };
          case (?offers) {
            let updatedOffers = offers.map<TransportOffer, TransportOffer>(
              func(offer) {
                if (offer.transporter == transporter) {
                  { offer with accepted = true; commitmentId };
                } else {
                  offer;
                };
              },
            );
            transportMap.add(listingId, updatedOffers);
          };
        };
      };
    };
  };

  public shared ({ caller }) func updateTracking(
    listingId : Nat,
    currentLocation : Text,
    estimatedDeliveryTime : Text,
    trackingStatus : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to update tracking");
    };

    if (not hasAppRole(caller, #Transporter)) {
      Runtime.trap("Unauthorized: Only transporters can update tracking");
    };

    switch (listingMap.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?_) {
        switch (transportMap.get(listingId)) {
          case (null) { Runtime.trap("No transport offers found for this listing") };
          case (?offers) {
            var offerFound = false;
            let updatedOffers = offers.map<TransportOffer, TransportOffer>(
              func(offer) {
                if (offer.transporter == caller and offer.accepted) {
                  offerFound := true;
                  {
                    offer with
                    currentLocation;
                    estimatedDeliveryTime;
                    trackingStatus;
                  };
                } else {
                  offer;
                };
              },
            );

            if (not offerFound) {
              Runtime.trap("Unauthorized: You can only update tracking for your own accepted transport offers");
            };

            transportMap.add(listingId, updatedOffers);
          };
        };
      };
    };
  };

  public query ({ caller }) func getAvailableListings() : async [HarvestListing] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view listings");
    };
    listingMap.toArray().map(func((_, listing)) { listing });
  };

  public query ({ caller }) func getListingDetails(listingId : Nat) : async HarvestListing {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view listing details");
    };
    switch (listingMap.get(listingId)) {
      case (null) { Runtime.trap("Listing does not exist") };
      case (?listing) { listing };
    };
  };

  public query ({ caller }) func getCommitments(listingId : Nat) : async [Commitment] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view commitments");
    };

    switch (listingMap.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (listing.farmer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the listing owner can view commitments");
        };

        switch (commitmentMap.get(listingId)) {
          case (null) { [] };
          case (?commitments) { commitments.toArray() };
        };
      };
    };
  };

  public query ({ caller }) func getTransportOffers(listingId : Nat) : async [TransportOffer] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view transport offers");
    };

    switch (listingMap.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (listing.farmer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the listing owner can view transport offers");
        };

        switch (transportMap.get(listingId)) {
          case (null) { [] };
          case (?offers) { offers.toArray() };
        };
      };
    };
  };

  public query ({ caller }) func searchListingsByCrop(cropType : Text) : async [HarvestListing] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to search listings");
    };
    let allListings = listingMap.toArray().map(func((_, listing)) { listing });
    allListings.filter(
      func(listing : HarvestListing) : Bool {
        listing.cropType.contains(#text cropType);
      }
    );
  };

  public query ({ caller }) func getSortedCommitments(listingId : Nat) : async [Commitment] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view commitments");
    };

    switch (listingMap.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (listing.farmer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the listing owner can view commitments");
        };

        switch (commitmentMap.get(listingId)) {
          case (null) { [] };
          case (?commitments) {
            let commitmentsArray = commitments.toArray();
            commitmentsArray.sort(
              func(a, b) {
                Nat.compare(a.quantity, b.quantity);
              }
            );
          };
        };
      };
    };
  };

  public query ({ caller }) func getSortedListings() : async [HarvestListing] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view listings");
    };
    let allListings = listingMap.toArray().map(func((_, listing)) { listing });
    allListings.sort(
      func(a, b) {
        Int.compare(a.harvestDate, b.harvestDate);
      }
    );
  };

  public query ({ caller }) func filterListings(criteria : ListingFilterCriteria) : async [HarvestListing] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to filter listings");
    };
    let allListings = listingMap.toArray().map(func((_, listing)) { listing });
    allListings.filter(
      func(listing : HarvestListing) : Bool {
        let cropTypeMatches = switch (criteria.cropType) {
          case (null) { true };
          case (?cropType) { listing.cropType.contains(#text cropType) };
        };

        let locationMatches = switch (criteria.location) {
          case (null) { true };
          case (?location) { listing.location.contains(#text location) };
        };

        let readinessScoreMatches = switch (criteria.minReadinessScore) {
          case (null) { true };
          case (?score) { listing.readinessScore >= score };
        };

        let qualityCertificateMatches = switch (criteria.qualityCertificateRequired) {
          case (null) { true };
          case (?required) { listing.qualityCertificate == required };
        };

        cropTypeMatches and locationMatches and readinessScoreMatches and qualityCertificateMatches;
      }
    );
  };

  public shared ({ caller }) func deleteListing(listingId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to delete listings");
    };

    switch (listingMap.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (listing.farmer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the listing owner or admins can delete listings");
        };

        listingMap.remove(listingId);
        commitmentMap.remove(listingId);
        transportMap.remove(listingId);
      };
    };
  };

  public query ({ caller }) func getCommitmentsByBuyer() : async [Commitment] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view commitments");
    };

    if (not hasAppRole(caller, #Buyer)) {
      Runtime.trap("Unauthorized: Only buyers can view their commitments");
    };

    let resultList = List.empty<Commitment>();

    commitmentMap.forEach(
      func(_listingId, commitments) {
        let filtered = commitments.filter(
          func(commitment) {
            commitment.buyer == caller;
          }
        );
        resultList.addAll(filtered.values());
      }
    );

    resultList.toArray();
  };

  public shared ({ caller }) func createBuyerDemand(
    cropType : Text,
    quantity : Nat,
    pricePerKg : Nat,
    destinationSupply : Text,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to create buyer demand");
    };

    if (not hasAppRole(caller, #Buyer)) {
      Runtime.trap("Unauthorized: Only buyers can create demand requests");
    };

    let demandId = nextBuyerDemandId;
    let newDemand = {
      id = demandId;
      buyerId = caller;
      cropType;
      quantity;
      pricePerKg;
      destinationSupply;
      createdAt = Time.now();
      status = "open";
      linkedListing = null;
    };
    buyerDemandsMap.add(demandId, newDemand);
    nextBuyerDemandId += 1;
    demandId;
  };

  public query ({ caller }) func getBuyerDemands() : async [BuyerDemand] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view buyer demands");
    };

    if (not hasAppRole(caller, #Buyer)) {
      Runtime.trap("Unauthorized: Only buyers can view their demands");
    };

    let allDemands = buyerDemandsMap.toArray().map(func((_, demand)) { demand });
    allDemands.filter(
      func(demand : BuyerDemand) : Bool {
        demand.buyerId == caller;
      }
    );
  };

  public query ({ caller }) func getAllBuyerDemands() : async [BuyerDemand] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view buyer demands");
    };

    if (not hasAppRole(caller, #Farmer)) {
      Runtime.trap("Unauthorized: Only farmers can view all demands");
    };

    buyerDemandsMap.toArray().map(func((_, demand)) { demand }).filter(
      func(demand : BuyerDemand) : Bool {
        demand.status == "open";
      }
    );
  };

  public shared ({ caller }) func acceptBuyerDemand(demandId : Nat, listingId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to accept buyer demand");
    };

    if (not hasAppRole(caller, #Farmer)) {
      Runtime.trap("Unauthorized: Only farmers can accept buyer demands");
    };

    switch (listingMap.get(listingId)) {
      case (null) { Runtime.trap("Listing does not exist") };
      case (?listing) {
        if (listing.farmer != caller) {
          Runtime.trap("Unauthorized: Only the listing owner can link their listing to a buyer demand");
        };

        switch (buyerDemandsMap.get(demandId)) {
          case (null) { Runtime.trap("Buyer demand does not exist") };
          case (?demand) {
            if (demand.status != "open") {
              Runtime.trap("Buyer demand is already accepted or closed");
            };

            let updatedDemand = {
              demand with
              status = "accepted";
              linkedListing = ?listingId;
            };
            buyerDemandsMap.add(demandId, updatedDemand);
          };
        };
      };
    };
  };

  // Machine Learning Functions
  public query ({ caller }) func predictYieldAndPrice(
    cropType : Text,
    location : Text,
    daysPassed : Nat,
    totalGrowthCycle : Nat,
    quantity : Nat,
  ) : async PredictYieldResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to predict yields and prices");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Must be registered to predict yields and prices") };
      case (?userProfile) {
        switch (userProfile.appRole) {
          case (#Farmer) {
            let readinessData = {
              daysPassed;
              totalGrowthCycle;
              cropType;
              location;
              farmerAssessmentScore = 0.0;
            };

            let readinessScore : Float = predictCropReadiness(readinessData);
            let growthFactor : Float = if (totalGrowthCycle > 0) {
              daysPassed.toFloat() / totalGrowthCycle.toFloat();
            } else { 1.0 };

            let samplePricePerUnit : Float = 5.0;
            let predictedYield : Float = (quantity.toFloat() * readinessScore * growthFactor) / 100.0;
            let predictedPrice : Float = (samplePricePerUnit * predictedYield);

            {
              predictedYield;
              predictedPrice;
            };
          };
          case (_) {
            Runtime.trap("Unauthorized: Only farmers can predict yields and prices");
          };
        };
      };
    };
  };

  public query ({ caller }) func analyzeCropMaturity(_image : Blob) : async Float {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to analyze crop maturity");
    };

    50.0;
  };

  // Route Optimization Function
  public shared ({ caller }) func optimizeLogisticsRoutes(
    vehicleCapacity : Nat,
    vehicleType : VehicleType,
    startLocation : Text,
    deliveryLocation : Text,
  ) : async [OptimizedRoute] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to optimize logistics routes");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Must be registered to optimize logistics routes") };
      case (?userProfile) {
        switch (userProfile.appRole) {
          case (#Transporter) {
            let availableListings = listingMap.toArray().map(func((_, listing)) { listing });
            let filteredListings = availableListings.filter(
              func(listing) {
                listing.quantity <= vehicleCapacity and listing.location.contains(#text startLocation);
              }
            );

            if (filteredListings.size() > 0) {
              let pickups = filteredListings.map(
                func(listing) {
                  { location = listing.location; quantity = listing.quantity };
                }
              );

              let newRoute = {
                pickupLocations = pickups;
                deliveryLocations = [{ location = deliveryLocation; quantity = vehicleCapacity }];
                distance = 100.0;
                costSavings = 50.0;
              };

              let existingRoutes = switch (routeMap.get(caller)) {
                case (null) { [] };
                case (?routes) { routes };
              };

              let allRoutes = existingRoutes.concat([newRoute]);
              routeMap.add(caller, allRoutes);
              allRoutes;
            } else { [] };
          };
          case (_) { [] };
        };
      };
    };
  };

  public query ({ caller }) func parseHarvestInput(_rawInput : Text) : async ParsedHarvestData {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to parse input");
    };

    {
      cropType = "Tomatoes";
      quantity = 50;
      harvestDate = Time.now();
      location = "Farm A";
    };
  };

  public shared ({ caller }) func diagnoseCrop(listingId : Nat, _image : Blob) : async CropAnalysisReport {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to diagnose crops");
    };

    if (not hasAppRole(caller, #Farmer)) {
      Runtime.trap("Unauthorized: Only farmers can diagnose crops");
    };

    switch (listingMap.get(listingId)) {
      case (null) {
        Runtime.trap("Listing not found");
      };
      case (?listing) {
        if (listing.farmer != caller) {
          Runtime.trap("Unauthorized: Only the listing owner can diagnose their crops");
        };

        // Simulate analysis result (replace with real logic if available)
        let analysis : CropAnalysisReport = {
          harvestReadinessScore = 85.0;
          qualityGrade = #Premium;
          healthFactors = {
            pestDetection = false;
            diseases = [{ name = "leaf rust"; severity = 2 }];
            nutrientDeficiencies = [{ name = "Potassium"; impact = 1 }];
          };
        };

        let updatedListing = { listing with diagnosis = ?analysis };
        listingMap.add(listingId, updatedListing);

        analysis;
      };
    };
  };
};
