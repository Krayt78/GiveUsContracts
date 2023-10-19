import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, upgrades }  from "hardhat";
const { BN, expectRevert } = require('@openzeppelin/test-helpers');


describe("Crowdfunding Contract", function () {
  async function deployCrowdfundingFixture() {
    const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
    const [owner, addr1, addr2] = await ethers.getSigners();

    const crowdfunding = await upgrades.deployProxy(Crowdfunding, { initializer: 'initialize' });

    await crowdfunding.deployed();

    // Fixtures can return anything you consider useful for your tests
    return { Crowdfunding, crowdfunding, owner, addr1, addr2 };
  }
  async function deployUSDCFixture() {
    const USDC = await ethers.getContractFactory("USDC");

    const usdc = await USDC.deploy();

    await usdc.deployed();

    return { USDC, usdc };
  }
  async function createProjectDataAndUSDCFixture() {
    const { Crowdfunding, crowdfunding, owner, addr1, addr2 } = await loadFixture(deployCrowdfundingFixture);
    const { USDC, usdc } = await loadFixture(deployUSDCFixture);

    const requiredAmountToFund = 300000;

    const voteSession = {
      isVotingInSession: false,
      positiveVotes: 0,
      negativeVotes: 0,
    }

    const threshold1 = {
      budget: 50000,
      voteSession: voteSession
    }

    const threshold2 = {
      budget: 100000,
      voteSession: voteSession
    }

    const threshold3 = {
      budget: 150000,
      voteSession: voteSession
    }

    const thresholds = [threshold1, threshold2, threshold3];
    const emptyThresholds = [threshold1];
    emptyThresholds.pop();

    let projectData = {
      owner: owner.address,
      exchangeTokenAddress: usdc.address,
      name: "MyProjectName",
      assoName: "MyAssoName",
      teamMembers: ["TeamMember1", "TeamMember2"],
      description: "MyDescription",
      requiredAmount: requiredAmountToFund,
      requiredVotePercentage: 5000,
      voteCooldown: 1,
      donationFee: 0
    };

    let projectDataZero = {
      owner: owner.address,
      exchangeTokenAddress: usdc.address,
      name: "MyProjectName",
      assoName: "MyAssoName",
      teamMembers: ["TeamMember1", "TeamMember2"],
      description: "MyDescription",
      requiredAmount: 0,
      requiredVotePercentage: 5000,
      voteCooldown: 1,
      donationFee: 0
    };

    return { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc, projectDataZero };
  }
  async function createProjectDataZeroAmountAndUSDCFixture() {
    const { Crowdfunding, crowdfunding, owner, addr1, addr2 } = await loadFixture(deployCrowdfundingFixture);
    const { USDC, usdc } = await loadFixture(deployUSDCFixture);

    const requiredAmountToFund = 0;

    const voteSession = {
      isVotingInSession: false,
      positiveVotes: 0,
      negativeVotes: 0,
    }

    const threshold1 = {
      budget: 50000,
      voteSession: voteSession
    }

    const threshold2 = {
      budget: 100000,
      voteSession: voteSession
    }

    const threshold3 = {
      budget: 150000,
      voteSession: voteSession
    }

    const thresholds = [threshold1, threshold2, threshold3];
    const emptyThresholds = [threshold1];
    emptyThresholds.pop();

    let projectData = {
      owner: owner.address,
      exchangeTokenAddress: usdc.address,
      name: "MyProjectName",
      assoName: "MyAssoName",
      teamMembers: ["TeamMember1", "TeamMember2"],
      description: "MyDescription",
      requiredAmount: requiredAmountToFund,
      requiredVotePercentage: 5000,
      voteCooldown: 1,
      donationFee: 0
    };

    let projectDataZero = {
      owner: owner.address,
      exchangeTokenAddress: usdc.address,
      name: "MyProjectName",
      assoName: "MyAssoName",
      teamMembers: ["TeamMember1", "TeamMember2"],
      description: "MyDescription",
      requiredAmount: 0,
      requiredVotePercentage: 5000,
      voteCooldown: 1,
      donationFee: 0
    };

    return { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc, projectDataZero };
  }
  async function createProjectAndUSDCFixture() {
    const { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc } = await loadFixture(createProjectDataAndUSDCFixture);
    await crowdfunding.addNewSupportedToken(usdc.address, { from: owner.address });
    await crowdfunding.createProject(projectData, thresholds, { from: owner.address });
    return { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc };
  }
  async function createProjectAndDonateMaxFixture() {
    const { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc } = await loadFixture(createProjectAndUSDCFixture);
    const mintAmount = 100000;
    const donatedAmount = 100000;
    const projectID = 0;
    await usdc.mint(mintAmount);
    await usdc.approve(crowdfunding.address, mintAmount);
    await crowdfunding.donateToProject(projectID, donatedAmount);
    return { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc, mintAmount, donatedAmount, projectID };
  }
  async function createProjectAndFundFixture() {
    const { Crowdfunding, crowdfunding, owner, addr1, addr2 } = await loadFixture(deployCrowdfundingFixture);
    const { USDC, usdc } = await loadFixture(deployUSDCFixture);

    const requiredAmountToFund = 100000;
    const voteSession = {
      isVotingInSession: false,
      positiveVotes: 0,
      negativeVotes: 0,
    }
    const threshold1 = {
      budget: 100000,
      voteSession: voteSession
    }
    const thresholds = [threshold1];

    let projectData = {
      owner: owner.address,
      exchangeTokenAddress: usdc.address,
      name: "MyProjectName",
      assoName: "MyAssoName",
      teamMembers: ["TeamMember1", "TeamMember2"],
      description: "MyDescription",
      requiredAmount: requiredAmountToFund,
      requiredVotePercentage: 5000,
      voteCooldown: 1,
      donationFee: 1000 //10%
    };

    await crowdfunding.addNewSupportedToken(usdc.address, { from: owner.address });
    await crowdfunding.createProject(projectData, thresholds, { from: owner.address });
    const mintAmount = requiredAmountToFund*2;
    const donatedAmount = requiredAmountToFund*2;
    const projectID = 0;
    await usdc.mint(mintAmount);
    await usdc.approve(crowdfunding.address, mintAmount);
    await crowdfunding.donateToProject(projectID, donatedAmount);

    //get the fees
    const fees = await crowdfunding.getFeesAvailableToWithdraw(usdc.address);
    expect(fees).to.be.equal(donatedAmount/10);

    const pdata = await crowdfunding.getProject(projectID);
    const currentThreshold = await crowdfunding.getProjectThresholds(projectID, pdata.currentThreshold);
    expect(currentThreshold.voteSession.isVotingInSession).to.be.equal(true);

    await crowdfunding.voteForThreshold(projectID, 1);
    await crowdfunding.endThresholdVoting(projectID);
    return { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, USDC, usdc, mintAmount, donatedAmount, projectID };
  }
  async function createProjectAndDonateFixture() {
    const { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc } = await loadFixture(createProjectAndUSDCFixture);
    const mintAmount = 100000;
    const donatedAmount = 20000;
    const projectID = 0;
    await usdc.mint(mintAmount);
    await usdc.approve(crowdfunding.address, mintAmount);
    await crowdfunding.donateToProject(projectID, donatedAmount);
    return { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc, mintAmount, donatedAmount, projectID };
  }
  async function createSecondProject() {
    const { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc } = await loadFixture(createProjectAndDonateFixture);
    
    const requiredAmountToFund = 300000;

    const voteSession = {
      isVotingInSession: false,
      positiveVotes: 0,
      negativeVotes: 0,
    }

    const threshold1 = {
      budget: 50000,
      voteSession: voteSession
    }

    const threshold2 = {
      budget: 100000,
      voteSession: voteSession
    }

    const threshold3 = {
      budget: 150000,
      voteSession: voteSession
    }

    const secondProjectThresholds = [threshold1, threshold2, threshold3];
    emptyThresholds.pop();

    let secondProjectData = {
      owner: owner.address,
      exchangeTokenAddress: usdc.address,
      name: "secondProject",
      assoName: "MysecondProject",
      teamMembers: ["TeamMember1", "TeamMember2"],
      description: "secondProject",
      requiredAmount: requiredAmountToFund,
      requiredVotePercentage: 5000,
      voteCooldown: 1,
      donationFee: 0
    };

    await crowdfunding.createProject(secondProjectData, secondProjectThresholds, { from: owner.address });
    return { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc, secondProjectData, secondProjectThresholds };
  }
  async function createProjectWithDifferentToken() {
    const { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc } = await loadFixture(createProjectAndDonateFixture);
    
    const requiredAmountToFund = 300000;

    const voteSession = {
      isVotingInSession: false,
      positiveVotes: 0,
      negativeVotes: 0,
    }

    const threshold1 = {
      budget: 50000,
      voteSession: voteSession
    }

    const threshold2 = {
      budget: 100000,
      voteSession: voteSession
    }

    const threshold3 = {
      budget: 150000,
      voteSession: voteSession
    }

    const secondProjectThresholds = [threshold1, threshold2, threshold3];
    emptyThresholds.pop();

    let thirdProjectData = {
      owner: owner.address,
      exchangeTokenAddress: owner.address,
      name: "thirdProject",
      assoName: "thirdProject",
      teamMembers: ["TeamMember1", "TeamMember2"],
      description: "thirdProject",
      requiredAmount: requiredAmountToFund,
      requiredVotePercentage: 5000,
      voteCooldown: 1,
      donationFee: 0
    };

    await crowdfunding.addNewSupportedToken(owner.address, { from: owner.address });
    await crowdfunding.createProject(thirdProjectData, secondProjectThresholds, { from: owner.address });
    
    return { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc, thirdProjectData, secondProjectThresholds };
  }
  async function createProjectAndStartedVotingFixture() {
    const { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc, projectID } = await loadFixture(createProjectAndDonateMaxFixture);
    const threshold = await crowdfunding.getProjectThresholds(projectID, 0);
    expect(threshold.voteSession.isVotingInSession).to.be.equal(true);
    return { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc, projectID };
  }
  async function donateToProject3AndVote() {
    const { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc } = await loadFixture(createProjectAndUSDCFixture);
    const mintAmount = 100000;
    const donatedAmount = 100000;
    const projectID = 0;
    await usdc.mint(mintAmount);
    await usdc.approve(crowdfunding.address, mintAmount);
    await crowdfunding.donateToProject(projectID, donatedAmount);

    await usdc.connect(addr1).mint(mintAmount);
    await usdc.connect(addr1).approve(crowdfunding.address, mintAmount);
    await crowdfunding.connect(addr1).donateToProject(projectID, donatedAmount);

    await usdc.connect(addr2).mint(mintAmount);
    await usdc.connect(addr2).approve(crowdfunding.address, mintAmount);
    await crowdfunding.connect(addr2).donateToProject(projectID, donatedAmount);

    const threshold = await crowdfunding.getProjectThresholds(projectID, 0);
    expect(threshold.voteSession.isVotingInSession).to.be.equal(true);

    return { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc, mintAmount, donatedAmount, projectID };
  }
  async function donateToProject3AndHasVoted() {
    const { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc } = await loadFixture(donateToProject3AndVote);
    const projectID = 0;
    const voteValue = true;
    await crowdfunding.connect(owner).voteForThreshold(0, voteValue);
    return { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc, projectID, voteValue};
  }

  describe("Upgrade", function() {
    it('Should Upgrade to V2', async () => {
      const { crowdfunding, usdc } = await loadFixture(createProjectDataAndUSDCFixture);
      const CrowdfundingV2 = await ethers.getContractFactory("CrowdfundingV2");

      const crowdfundingUpgraded = await upgrades.upgradeProxy(crowdfunding.address, CrowdfundingV2);
      expect(crowdfundingUpgraded.address).to.be.equal(crowdfunding.address);

      const isUpgraded = await crowdfundingUpgraded.getMyNewvariable();
      expect(isUpgraded).to.be.equal(0);

      await crowdfundingUpgraded.setMyNewvariable(1);
      const isUpgraded2 = await crowdfundingUpgraded.getMyNewvariable();
      expect(isUpgraded2).to.be.equal(1);
    });
  });

  describe("Deployment", function () {
    describe("Initializer", function () {
      it("Should not initlaize twice", async function () {
        const { owner, crowdfunding } = await loadFixture(deployCrowdfundingFixture);
        await expectRevert(crowdfunding.initialize(),"Initializable: contract is already initialized") 
      });
    });
    describe("USDC mint(uint amount)", function () {
      it("Should mint amount", async function () {
        const { owner, usdc } = await loadFixture(createProjectDataAndUSDCFixture);
        const amount = 10000;
        await usdc.mint(amount);
        expect(await usdc.balanceOf(owner.address)).to.be.equal(amount);
      });
    });

    describe("Initializer()", function () {
      it("Should grant role DEFAULT_ADMIN_ROLE", async function () {
        const { crowdfunding, owner, addr1, addr2 } = await loadFixture(deployCrowdfundingFixture);
        let DEFAULT_ADMIN_ROLE = await crowdfunding.DEFAULT_ADMIN_ROLE({ from: owner.address });
        expect(await crowdfunding.hasRole(DEFAULT_ADMIN_ROLE, owner.address, { from: owner.address })).to.equal(true);
      });

      it("Should grant role PAUSER_ROLE", async function () {
        const { crowdfunding, owner, addr1, addr2 } = await loadFixture(deployCrowdfundingFixture);
        let PAUSER_ROLE = await crowdfunding.PAUSER_ROLE({ from: owner.address });
        expect(await crowdfunding.hasRole(PAUSER_ROLE, owner.address, { from: owner.address })).to.equal(true);
      });

      it("Should grant role PAUSER_ROLE", async function () {
        const { crowdfunding, owner, addr1, addr2 } = await loadFixture(deployCrowdfundingFixture);
        let UPDATER_ROLE = await crowdfunding.UPDATER_ROLE({ from: owner.address });
        expect(await crowdfunding.hasRole(UPDATER_ROLE, owner.address, { from: owner.address })).to.equal(true);
      });
    });

    describe("pause()", function () {
      it("should not pause, revert : Access Control", async () => {
        const { crowdfunding, owner, addr1, addr2, projectData, thresholds } = await loadFixture(createProjectDataAndUSDCFixture);
        let PAUSER_ROLE = await crowdfunding.connect(addr1).PAUSER_ROLE();
        await expectRevert(crowdfunding.connect(addr1).pause(),
          "AccessControl: account " +
          addr1.address.toLowerCase() +
          " is missing role " +
          PAUSER_ROLE
        );
      });

      it("should not pause twice, revert : Pausable: paused", async () => {
        const { crowdfunding, owner, addr1, addr2, projectData, thresholds } = await loadFixture(createProjectDataAndUSDCFixture);
        await crowdfunding.connect(owner).pause();
        await expectRevert(crowdfunding.connect(owner).pause(), "Pausable: paused");
      });

      it("should pause", async () => {
        const { crowdfunding, owner, addr1, addr2, projectData, thresholds } = await loadFixture(createProjectDataAndUSDCFixture);
        await crowdfunding.connect(owner).pause();
        expect(await crowdfunding.connect(owner).paused()).to.be.equal(true);
      });
    });

    describe("unpause()", function () {
      it("should not unpause, revert : Access Control", async () => {
        const { crowdfunding, owner, addr1, addr2, projectData, thresholds } = await loadFixture(createProjectDataAndUSDCFixture);
        let PAUSER_ROLE = await crowdfunding.connect(addr1).PAUSER_ROLE();
        await crowdfunding.connect(owner).pause();
        await expectRevert(crowdfunding.connect(addr1).unpause(),
          "AccessControl: account " +
          addr1.address.toLowerCase() +
          " is missing role " +
          PAUSER_ROLE
        );
      });

      it("should not unpause not paused, revert : Pausable: not paused", async () => {
        const { crowdfunding, owner, addr1, addr2, projectData, thresholds } = await loadFixture(createProjectDataAndUSDCFixture);
        await expectRevert(crowdfunding.connect(owner).unpause(), "Pausable: not paused");
      });

      it("should unpause", async () => {
        const { crowdfunding, owner, addr1, addr2, projectData, thresholds } = await loadFixture(createProjectDataAndUSDCFixture);
        await crowdfunding.connect(owner).pause();
        await crowdfunding.connect(owner).unpause();
        expect(await crowdfunding.connect(owner).paused()).to.be.equal(false);
      });

    });

    describe("createProject(Project calldata _project)", function () {
      it("Should not create project, revert : Missing Role", async function () {
        const { crowdfunding, owner, addr1, addr2, projectData, thresholds } = await loadFixture(createProjectDataAndUSDCFixture);
        let UPDATER_ROLE = await crowdfunding.connect(addr1).UPDATER_ROLE();
        await expectRevert(crowdfunding.connect(addr1).createProject(projectData, thresholds),
          "AccessControl: account " +
          addr1.address.toLowerCase() +
          " is missing role " +
          UPDATER_ROLE);
      });

      it("Should not create project, revert : Paused", async function () {
        const { crowdfunding, owner, addr1, addr2, projectData, thresholds } = await loadFixture(createProjectDataAndUSDCFixture);
        await crowdfunding.connect(owner).pause();
        await expectRevert(crowdfunding.connect(owner).createProject(projectData, thresholds), "Pausable: paused");
      });

      it("Should not create project, revert : Token not supported", async function () {
        const {Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds } = await loadFixture(createProjectDataAndUSDCFixture);
        await expect(crowdfunding.createProject(projectData, thresholds, { from: owner.address })).to.be.revertedWithCustomError(Crowdfunding, 'TokenNotSupported');
      });

      it("Should not create project, revert : Need at least one Threshold", async function () {
        const {Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, emptyThresholds, usdc } = await loadFixture(createProjectDataAndUSDCFixture);
        await crowdfunding.addNewSupportedToken(usdc.address, { from: owner.address });
        await expect(crowdfunding.createProject(projectData, emptyThresholds, { from: owner.address })).to.be.revertedWithCustomError(Crowdfunding, 'ZeroThresholds');
      });

      it("Should not create project, revert : ZeroRequiredAmount", async function () {
        const {Crowdfunding, crowdfunding, owner, addr1, addr2, projectDataZero, thresholds, usdc } = await loadFixture(createProjectDataAndUSDCFixture);
        await crowdfunding.addNewSupportedToken(usdc.address, { from: owner.address });
        await expect(crowdfunding.createProject(projectDataZero, thresholds, { from: owner.address })).to.be.revertedWithCustomError(Crowdfunding, 'ZeroRequiredAmount');
      });

      it("Should not create project, revert : CantGoAbove10000", async function () {
        const {Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, usdc } = await loadFixture(createProjectDataAndUSDCFixture);
        await crowdfunding.addNewSupportedToken(usdc.address, { from: owner.address });
        let modifiedProjectData = projectData;
        modifiedProjectData.requiredVotePercentage = 10001;
        await expect(crowdfunding.createProject(modifiedProjectData, thresholds, { from: owner.address })).to.be.revertedWithCustomError(Crowdfunding, 'CantGoAbove10000');
      });

      it("Should not create project, revert : CantGoAbove10000", async function () {
        const {Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, usdc } = await loadFixture(createProjectDataAndUSDCFixture);
        await crowdfunding.addNewSupportedToken(usdc.address, { from: owner.address });
        let modifiedProjectData = projectData;
        modifiedProjectData.donationFee = 10001;
        modifiedProjectData.requiredVotePercentage = 5000;
        await expect(crowdfunding.createProject(modifiedProjectData, thresholds, { from: owner.address })).to.be.revertedWithCustomError(Crowdfunding, 'CantGoAbove10000');
      });

      it("Should not create project, revert : ZeroAddress", async function () {
        const {Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, usdc } = await loadFixture(createProjectDataAndUSDCFixture);
        await crowdfunding.addNewSupportedToken(usdc.address, { from: owner.address });
        let modifiedProjectData = projectData;
        modifiedProjectData.owner = ethers.constants.AddressZero;
        modifiedProjectData.donationFee = 1000;
        modifiedProjectData.requiredVotePercentage = 5000;
        await expect(crowdfunding.createProject(modifiedProjectData, thresholds, { from: owner.address })).to.be.revertedWithCustomError(Crowdfunding, 'ZeroAddress');
      });

      it("Should not create project, revert : ZeroVoteCooldown", async function () {
        const {Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, usdc } = await loadFixture(createProjectDataAndUSDCFixture);
        await crowdfunding.addNewSupportedToken(usdc.address, { from: owner.address });
        let modifiedProjectData = projectData;
        modifiedProjectData.owner = owner.address;
        modifiedProjectData.voteCooldown = 0;
        await expect(crowdfunding.createProject(modifiedProjectData, thresholds, { from: owner.address })).to.be.revertedWithCustomError(Crowdfunding, 'ZeroVoteCooldown');
      });

      it("Should not create project, revert : ZeroRequiredVotePercentage", async function () {
        const {Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, usdc } = await loadFixture(createProjectDataAndUSDCFixture);
        await crowdfunding.addNewSupportedToken(usdc.address, { from: owner.address });
        let modifiedProjectData = projectData;
        modifiedProjectData.voteCooldown = 1;
        modifiedProjectData.requiredVotePercentage = 0;
        await expect(crowdfunding.createProject(modifiedProjectData, thresholds, { from: owner.address })).to.be.revertedWithCustomError(Crowdfunding, 'ZeroRequiredVotePercentage');
      });

      it("Should create project", async function () {
        const { crowdfunding, owner, addr1, addr2, projectData, thresholds, usdc } = await loadFixture(createProjectDataAndUSDCFixture);
        projectData.requiredVotePercentage = 5000;
        
        await crowdfunding.addNewSupportedToken(usdc.address, { from: owner.address });
        await crowdfunding.createProject(projectData, thresholds, { from: owner.address });

        const projectDataReturned = await crowdfunding.getProject(0, { from: owner.address });

        expect(projectData.owner).to.be.equal(projectDataReturned.owner);
        expect(projectData.exchangeTokenAddress).to.be.equal(projectDataReturned.exchangeTokenAddress);
        expect(projectData.name).to.be.equal(projectDataReturned.name);
        expect(projectData.assoName).to.be.equal(projectDataReturned.assoName);
        expect(projectData.description).to.be.equal(projectDataReturned.description);
        expect(projectData.requiredAmount).to.be.equal(projectDataReturned.requiredAmount);
        expect(projectDataReturned.currentAmount).to.be.equal(0);
        expect(projectDataReturned.currentThreshold).to.be.equal(0);
        expect(projectDataReturned.nbOfThresholds).to.be.equal(3);
        expect(projectData.requiredVotePercentage).to.be.equal(projectDataReturned.requiredVotePercentage);

        for (let i = 0; i < 3; i++) {
          const thresholdDataReturned = await crowdfunding.getProjectThresholds(0, i);
          expect(thresholdDataReturned.budget).to.be.equal(thresholds[i].budget);

          const returnedVotingSession = thresholdDataReturned.voteSession;
          const votingSession = thresholds[i].voteSession;
          expect(returnedVotingSession.isVotingInSession).to.be.equal(votingSession.isVotingInSession);
          expect(returnedVotingSession.positiveVotes).to.be.equal(votingSession.positiveVotes);
          expect(returnedVotingSession.negativeVotes).to.be.equal(votingSession.negativeVotes);
        }

        //TODO Handle teammembers
        //expect(projectData.teamMembers).to.be.equal(projectDataReturned.teamMembers);
      });
    });
    describe("addNewSupportedToken(address tokenAddress)", function () {
      it("Should not add token, revert : AccessControl is missing role", async function () {
        const { crowdfunding, owner, addr1, addr2 } = await loadFixture(deployCrowdfundingFixture);
        const tokenAddress = owner.address;

        let UPDATER_ROLE = await crowdfunding.connect(addr1).UPDATER_ROLE();

        await expectRevert(crowdfunding.connect(addr1).addNewSupportedToken(tokenAddress),
          "AccessControl: account " +
          addr1.address.toLowerCase() +
          " is missing role " +
          UPDATER_ROLE
        );
      });

      it("Should not add token, revert : Zero address ", async function () {
        const { Crowdfunding, crowdfunding, owner} = await loadFixture(deployCrowdfundingFixture);
        await expect(crowdfunding.connect(owner).addNewSupportedToken(ethers.constants.AddressZero)).to.be.revertedWithCustomError(Crowdfunding, 'ZeroAddress');
      });

      it("Should add token", async function () {
        const { crowdfunding, owner, addr1, addr2 } = await loadFixture(deployCrowdfundingFixture);
        const tokenAddress = owner.address;

        await crowdfunding.addNewSupportedToken(tokenAddress);
        const token = await crowdfunding.isTokenSupported(tokenAddress);
        expect(token).to.be.equal(true);
      });
    });

    describe("withdrawFees(address tokenAddress)", function () {
      it("Should not withdrawFees, revert : AccessControl is missing role", async function () {
        const { crowdfunding, owner, addr1, addr2 } = await loadFixture(createProjectAndFundFixture);
        const tokenAddress = owner.address;

        let WITHDRAWER_ROLE = await crowdfunding.connect(addr1).WITHDRAWER_ROLE();

        await expectRevert(crowdfunding.connect(addr1).withdrawFees(tokenAddress),
          "AccessControl: account " +
          addr1.address.toLowerCase() +
          " is missing role " +
          WITHDRAWER_ROLE
        );
      });

      it("Should not withdrawFees, revert : Paused", async function () {
        const { crowdfunding, owner, addr1, addr2, projectData, thresholds, usdc } = await loadFixture(createProjectAndFundFixture);
        await crowdfunding.connect(owner).pause();
        await expectRevert(crowdfunding.connect(owner).withdrawFees(usdc.address), "Pausable: paused");
      });

      it("Should not withdrawFees, revert : ZeroAddress ", async function () {
        const { Crowdfunding, crowdfunding, owner} = await loadFixture(createProjectAndFundFixture);
        await expect(crowdfunding.connect(owner).withdrawFees(ethers.constants.AddressZero)).to.be.revertedWithCustomError(Crowdfunding, 'ZeroAddress');
      });

      it("Should not withdrawFees, revert : NoFeesToWithdraw ", async function () {
        const { Crowdfunding, crowdfunding, owner} = await loadFixture(createProjectAndFundFixture);
        await expect(crowdfunding.connect(owner).withdrawFees(owner.address)).to.be.revertedWithCustomError(Crowdfunding, 'NoFeesToWithdraw');
      });

      it("Should withdrawFees", async function () {
        const { Crowdfunding, crowdfunding, owner, usdc} = await loadFixture(createProjectAndFundFixture);
        const availableFees = await crowdfunding.getFeesAvailableToWithdraw(usdc.address);
        const currentUSDCBalance = await usdc.balanceOf(owner.address);

        await crowdfunding.connect(owner).withdrawFees(usdc.address);

        const newUSDCBalance = await usdc.balanceOf(owner.address);
        expect(newUSDCBalance).to.be.equal(currentUSDCBalance.add(availableFees));
        expect(await crowdfunding.getFeesAvailableToWithdraw(usdc.address)).to.be.equal(0);

      });

      it("Should withdrawFees and emit event withdrawFees ", async function () {
        const { Crowdfunding, crowdfunding, owner, usdc} = await loadFixture(createProjectAndFundFixture);
        const availableFees = await crowdfunding.getFeesAvailableToWithdraw(usdc.address);
        console.log(availableFees);
        await expect(crowdfunding.connect(owner).withdrawFees(usdc.address))
          .to.emit(crowdfunding, 'WithdrewFees')
          .withArgs(owner.address, usdc.address, availableFees);
      });
    });

    describe("donateToProject(uint id, uint amount)", function () {
      it("Shouldnt donate, revert : Paused", async function () {
        const { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc } = await loadFixture(createProjectDataAndUSDCFixture);
        await crowdfunding.connect(owner).pause();
        await expectRevert(crowdfunding.donateToProject(0, 10), "Pausable: paused");
      });
      it("Shouldnt donate, revert : Invalid Project Id", async function () {
        const { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc } = await loadFixture(createProjectDataAndUSDCFixture);
        await expect(crowdfunding.donateToProject(0, 10)).to.be.revertedWithCustomError(Crowdfunding, 'InvalidProjectId');
      });
      it("Shouldnt donate, revert : Min amount is 1", async function () {
        const { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc } = await loadFixture(createProjectAndUSDCFixture);
        await expect(crowdfunding.donateToProject(0, 0)).to.be.revertedWithCustomError(Crowdfunding, 'ZeroAmount');
      });
      
      it("Shouldnt donate, revert : Project not Active", async function () {
        const { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc } = await loadFixture(createProjectAndUSDCFixture);
        await crowdfunding.updateProjectStatus(0, 0);
        await expect(crowdfunding.donateToProject(0, 100)).to.be.revertedWithCustomError(Crowdfunding, 'ProjectNotActive');
      });
      it("Shouldnt donate, revert : Amount too small", async function () {
        const { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc } = await loadFixture(createProjectAndUSDCFixture);
        const mintAmount = 100000;
        await usdc.mint(mintAmount);
        await expect(crowdfunding.donateToProject(0, 5000)).to.be.revertedWithCustomError(Crowdfunding, 'AmountTooSmall');
      });
      it("Shouldnt donate, revert : Need to approve allowance first", async function () {
        const { Crowdfunding, crowdfunding, owner, addr1, addr2, projectData, thresholds, emptyThresholds, USDC, usdc } = await loadFixture(createProjectAndUSDCFixture);
        const mintAmount = 100000;
        await usdc.mint(mintAmount);
        await expect(crowdfunding.donateToProject(0, 20000)).to.be.revertedWithCustomError(Crowdfunding, 'AllowanceNotApproved');
      });
      it("Should donate and not put voteInSession", async function () {
        const { crowdfunding, owner, usdc, mintAmount, donatedAmount, projectID } = await loadFixture(createProjectAndDonateFixture);

        expect(await usdc.balanceOf(owner.address)).to.be.equal(mintAmount - donatedAmount);
        expect(await usdc.balanceOf(crowdfunding.address)).to.be.equal(donatedAmount);

        expect(await crowdfunding.getUserDonations(owner.address, projectID)).to.be.equal(donatedAmount);
        const project0 = await crowdfunding.getProject(projectID);
        expect(project0.currentAmount).to.be.equal(donatedAmount);

        const projectData = await crowdfunding.getProject(projectID);
        const currentThreshold = await crowdfunding.getProjectThresholds(projectID, projectData.currentThreshold);

        expect(currentThreshold.voteSession.isVotingInSession).to.be.equal(false);
      });

      it("Should donate put voteInSession", async function () {
        const { crowdfunding, owner, usdc, mintAmount, donatedAmount, projectID } = await loadFixture(createProjectAndDonateFixture);

        const donationAmount = 100000;
        await usdc.mint(donationAmount);
        await usdc.approve(crowdfunding.address, donationAmount);
        await crowdfunding.donateToProject(projectID, donationAmount);
        const projectData = await crowdfunding.getProject(projectID);
        const currentThreshold = await crowdfunding.getProjectThresholds(projectID, projectData.currentThreshold);

        expect(currentThreshold.voteSession.isVotingInSession).to.be.equal(true);
      });

      it("Should donate and emit Event", async function () {
        const { crowdfunding, owner, usdc, mintAmount, donatedAmount, projectID } = await loadFixture(createProjectAndDonateFixture);

        const donationAmount = 100000;
        await usdc.mint(donationAmount);
        await usdc.approve(crowdfunding.address, donationAmount);

        expect(await crowdfunding.donateToProject(projectID, donationAmount))
          .to.emit(crowdfunding, 'DonatedToProject').withArgs(owner.address, projectID, donationAmount);
      });
    });
    describe("isDonator(address user, uint256 id)", function () {
      it("Shouldnt Return , revert : Invalid Project Id", async function () {
        const {Crowdfunding, crowdfunding, owner } = await loadFixture(createProjectAndDonateFixture);
        const invalidProjectID = 100;
        await expect(crowdfunding.isDonator(owner.address, invalidProjectID)).to.be.revertedWithCustomError(Crowdfunding, 'InvalidProjectId');
      });
      it("Should Return true", async function () {
        const { crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
        expect(await crowdfunding.isDonator(owner.address, projectID)).to.be.equal(true);
      });
    });
    describe("isTokenSupported(address token)", function () {
      it("Should Return true", async function () {
        const { crowdfunding, usdc } = await loadFixture(createProjectAndUSDCFixture);
        expect(await crowdfunding.isTokenSupported(usdc.address)).to.be.equal(true);
      });
      it("Should Return false", async function () {
        const { crowdfunding, owner } = await loadFixture(createProjectAndUSDCFixture);
        expect(await crowdfunding.isTokenSupported(owner.address)).to.be.equal(false);
      });
      it("Should Return false because address 0", async function () {
        const { crowdfunding, owner } = await loadFixture(createProjectAndUSDCFixture);
        expect(await crowdfunding.isTokenSupported(ethers.constants.AddressZero)).to.be.equal(false);
      });
    });
    describe("voteForThreshold(uint256 id, bool vote)", function () {
      it("Shouldnt vote, revert : Paused", async function () {
        const {Crowdfunding, crowdfunding, owner, projectID } = await loadFixture(createProjectAndStartedVotingFixture);
        await crowdfunding.pause();
        await expectRevert(crowdfunding.connect(owner).voteForThreshold(projectID, true), "Pausable: paused");
      });
      it("Shouldnt vote, revert : Only Donators can vote", async function () {
        const {Crowdfunding, crowdfunding, addr1, projectID } = await loadFixture(createProjectAndStartedVotingFixture);
        await expect(crowdfunding.connect(addr1).voteForThreshold(projectID, true)).to.be.revertedWithCustomError(Crowdfunding, 'NotADonator');
      });
      it("Shouldnt vote, revert : Not in Voting Session", async function () {
        const {Crowdfunding, crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
        await expect(crowdfunding.connect(owner).voteForThreshold(projectID, true)).to.be.revertedWithCustomError(Crowdfunding, 'NotInVotingSession');
      });
      it("Shouldnt vote, revert : InvalidProjectId", async function () {
        const {Crowdfunding, crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
        await expect(crowdfunding.connect(owner).voteForThreshold(5000, true)).to.be.revertedWithCustomError(Crowdfunding, 'InvalidProjectId');
      });
      it("Shouldnt vote, revert : Can Only Vote Once", async function () {
        const {Crowdfunding, crowdfunding, owner, projectID } = await loadFixture(createProjectAndStartedVotingFixture);
        await crowdfunding.voteForThreshold(projectID, true);
        await expect(crowdfunding.connect(owner).voteForThreshold(projectID, 1)).to.be.revertedWithCustomError(Crowdfunding, 'CanOnlyVoteOnce');
      });
      it("Should vote positive", async function () {
        const { crowdfunding, owner, projectID } = await loadFixture(createProjectAndStartedVotingFixture);
        const positiveVotes = (await crowdfunding.getProjectThresholds(projectID, 0)).voteSession.positiveVotes;
        await crowdfunding.voteForThreshold(projectID, true);
        expect((await crowdfunding.getProjectThresholds(projectID, 0)).voteSession.positiveVotes).to.be.equal(positiveVotes + BN(1));
        expect(await crowdfunding.getThresholdVoteFromAddress(owner.address, projectID, 0)).to.be.equal(true);
      });
      it("Should vote negative", async function () {
        const { crowdfunding, owner, projectID } = await loadFixture(createProjectAndStartedVotingFixture);
        const negativeVotes = (await crowdfunding.getProjectThresholds(projectID, 0)).voteSession.negativeVotes;
        await crowdfunding.voteForThreshold(projectID, false);
        expect((await crowdfunding.getProjectThresholds(projectID, 0)).voteSession.negativeVotes).to.be.equal(negativeVotes + BN(1));
        expect(await crowdfunding.getThresholdVoteFromAddress(owner.address, projectID, 0)).to.be.equal(true);
      });
    });
    describe("endThresholdVoting(uint256 id)", function () {
      it("Shouldnt end voting, revert : Paused", async function () {
        const { crowdfunding, owner, projectID } = await loadFixture(createProjectAndStartedVotingFixture);
        await crowdfunding.pause();
        await expectRevert(crowdfunding.connect(owner).endThresholdVoting(projectID),"Pausable: paused");
      });
      it("Shouldnt end voting, revert : InvalidProjectId", async function () {
        const { crowdfunding, Crowdfunding, projectID } = await loadFixture(createProjectAndStartedVotingFixture);
        await expect(crowdfunding.endThresholdVoting(5000)).to.be.revertedWithCustomError(Crowdfunding, 'InvalidProjectId');
      });
      it("Shouldnt end voting, revert : You are not allowed", async function () {
        const { crowdfunding, addr1, projectID } = await loadFixture(createProjectAndStartedVotingFixture);
        let UPDATER_ROLE = await crowdfunding.connect(addr1).UPDATER_ROLE();
        await expectRevert(crowdfunding.connect(addr1).endThresholdVoting(projectID),
          "AccessControl: account " +
          addr1.address.toLowerCase() +
          " is missing role " +
          UPDATER_ROLE);
      });
      it("Shouldnt end voting, revert : Not in Voting Session", async function () {
        const {Crowdfunding, crowdfunding, addr1, projectID } = await loadFixture(createProjectAndDonateFixture);
        await expect(crowdfunding.endThresholdVoting(projectID)).to.be.revertedWithCustomError(Crowdfunding, 'NotInVotingSession');
      });
      it("Should end voting, & set voting session false", async function () {
        const { crowdfunding, addr1, projectID } = await loadFixture(createProjectAndStartedVotingFixture);
        await crowdfunding.voteForThreshold(projectID, true);
        await crowdfunding.endThresholdVoting(projectID);
        const threshold = await crowdfunding.getProjectThresholds(projectID, 0);
        expect(threshold.voteSession.isVotingInSession).to.be.equal(false);
      });
    });
    describe("DeliberateVote(uint256 id)", function () {
      it("Shouldnt deliberate, revert : Cant deliberate without votes", async function () {
        const {Crowdfunding, crowdfunding, addr1, projectID } = await loadFixture(createProjectAndStartedVotingFixture);
        await expect(crowdfunding.endThresholdVoting(projectID)).to.be.revertedWithCustomError(Crowdfunding, 'CantDeliberateWithoutVotes');
      });
      it("Should deliberate positive 1-0", async function () {
        const { crowdfunding, owner, usdc, projectID } = await loadFixture(createProjectAndStartedVotingFixture);
        const currentThreshold = 0;
        const thresholdBudget = (await crowdfunding.getProjectThresholds(projectID, currentThreshold)).budget;
        expect((await crowdfunding.getProject(projectID)).currentThreshold).to.be.equal(currentThreshold);
        await crowdfunding.voteForThreshold(projectID, true);
        await crowdfunding.endThresholdVoting(projectID);
        const threshold = await crowdfunding.getProjectThresholds(projectID, currentThreshold);
        expect(threshold.voteSession.isVotingInSession).to.be.equal(false);
        const projectdata = await crowdfunding.getProject(projectID);
        expect(projectdata.currentThreshold).to.be.equal(currentThreshold + 1);
        expect(projectdata.availableToWithdraw).to.be.equal(thresholdBudget);
      });

      it("Should deliberate negative whith 0-1", async function () {
        const { crowdfunding, owner, usdc, projectID } = await loadFixture(createProjectAndStartedVotingFixture);
        const currentThreshold = 0;
        expect((await crowdfunding.getProject(projectID)).currentThreshold).to.be.equal(currentThreshold);
        await crowdfunding.voteForThreshold(projectID, false);
        await crowdfunding.endThresholdVoting(projectID);
        const threshold = await crowdfunding.getProjectThresholds(projectID, currentThreshold);
        expect(threshold.voteSession.isVotingInSession).to.be.equal(false);
        const projectdata = await crowdfunding.getProject(projectID);
        expect(projectdata.currentThreshold).to.be.equal(currentThreshold);
        expect(projectdata.availableToWithdraw).to.be.equal(0);
      });

      it("Should deliberate equal whith 1-1 with 50%", async function () {
        const { crowdfunding, owner, addr1, usdc, projectID } = await loadFixture(donateToProject3AndVote);
        const currentThreshold = 0;
        expect((await crowdfunding.getProject(projectID)).currentThreshold).to.be.equal(currentThreshold);

        await crowdfunding.voteForThreshold(projectID, 1);
        await crowdfunding.connect(addr1).voteForThreshold(projectID, false);

        await crowdfunding.endThresholdVoting(projectID);
        const threshold = await crowdfunding.getProjectThresholds(projectID, currentThreshold);
        expect(threshold.voteSession.isVotingInSession).to.be.equal(false);
        const projectdata = await crowdfunding.getProject(projectID);
        expect(projectdata.currentThreshold).to.be.equal(currentThreshold);
        expect(projectdata.availableToWithdraw).to.be.equal(0);
      });

    });
    describe("withdrawFunds(address exchangeTokenAddress)", function () {
      it("Shouldnt withdrawFunds, revert : Paused", async function () {
        const {Crowdfunding, crowdfunding, usdc, projectID } = await loadFixture(createProjectAndDonateFixture);
        await crowdfunding.pause();
        await expectRevert(crowdfunding.withdrawFunds(projectID), "Pausable: paused");
      });

      it("Shouldnt withdrawFunds, revert : No Funds to withdraw", async function () {
        const {Crowdfunding, crowdfunding, usdc, projectID } = await loadFixture(createProjectAndDonateFixture);
        await expect(crowdfunding.withdrawFunds(projectID)).to.be.revertedWithCustomError(Crowdfunding, 'NoFundsToWithdraw');
      });

      it("Shouldnt withdrawFunds, revert : InvalidProjectId", async function () {
        const {Crowdfunding, crowdfunding, usdc, projectID } = await loadFixture(createProjectAndDonateFixture);
        await expect(crowdfunding.withdrawFunds(100)).to.be.revertedWithCustomError(Crowdfunding, 'InvalidProjectId');
      });

      it("Shouldnt withdrawFunds, revert : NotProjectOwner", async function () {
        const {Crowdfunding, crowdfunding, addr1, projectID } = await loadFixture(createProjectAndDonateFixture);
        await expect(crowdfunding.connect(addr1).withdrawFunds(projectID)).to.be.revertedWithCustomError(Crowdfunding, 'NotProjectOwner');
      });

      it("Should withdrawFunds", async function () {
        const { crowdfunding, usdc, owner, projectID } = await loadFixture(createProjectAndFundFixture);
        const project = await crowdfunding.getProject(projectID);
        const balance = await usdc.balanceOf(owner.address);
        const availableToWithdraw = project.availableToWithdraw;
        await crowdfunding.withdrawFunds(projectID);
        const newBalance = await usdc.balanceOf(owner.address)
        const shouldNewBalance = balance.toNumber() + availableToWithdraw.toNumber();
        expect(newBalance.toNumber()).to.be.equal(shouldNewBalance);
        const newProject = await crowdfunding.getProject(projectID);
        const newAvailableToWithdraw = newProject.availableToWithdraw;
        expect(newAvailableToWithdraw.toNumber()).to.be.equal(0);
      });

      it("Should withdrawFunds & emit event", async function () {
        const { crowdfunding, usdc, owner, projectID } = await loadFixture(createProjectAndFundFixture);
        const balance = await usdc.balanceOf(owner.address);
        const availableToWithdraw = await crowdfunding.getProject(projectID).availableToWithdraw;
        expect(await crowdfunding.withdrawFunds(projectID))
          .to.emit(crowdfunding, 'WithdrewFunds').withArgs(owner.address, projectID, usdc.address, availableToWithdraw);
      });
    });
    describe("setDonationFee(uint projectId, uint16 newFee)", function () {
      it("Shouldnt change DonationFee, revert : InvalidProjectId", async function () {
        const {Crowdfunding, crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
        const newFee = 100;
        await expect(crowdfunding.connect(owner).setDonationFee(5000, newFee)).to.be.revertedWithCustomError(Crowdfunding, 'InvalidProjectId');
      });
      it("Shouldnt change DonationFee, revert : Cant go above 10000", async function () {
        const {Crowdfunding, crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
        const newFee = 25000;
        await expect(crowdfunding.connect(owner).setDonationFee(projectID, newFee)).to.be.revertedWithCustomError(Crowdfunding, 'CantGoAbove10000');
      });

      it("Shouldnt change DonationFee, revert : Access Control", async function () {
        const { crowdfunding, addr1, projectID } = await loadFixture(createProjectAndDonateFixture);
        let UPDATER_ROLE = await crowdfunding.connect(addr1).UPDATER_ROLE();
        const newFee = 100;
        await expectRevert(crowdfunding.connect(addr1).setDonationFee(projectID, newFee),
          "AccessControl: account " +
          addr1.address.toLowerCase() +
          " is missing role " +
          UPDATER_ROLE
        );
      });

      it("Should change DonationFee & emit event", async function () {
        const { crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
        const newFee = 1000;
        expect(await crowdfunding.connect(owner).setDonationFee(projectID, newFee))
          .to.emit(crowdfunding, 'DonationFeeUpdated').withArgs(projectID, newFee);
      });

      it("Should change DonationFee", async function () {
        const { crowdfunding, usdc, owner, projectID } = await loadFixture(createProjectAndFundFixture);
        const newFee = 100;
        await crowdfunding.connect(owner).setDonationFee(projectID, newFee);
        const projectData = await crowdfunding.connect(owner).getProject(projectID);
        expect(projectData.donationFee).to.be.equal(newFee);
      });
    });
    describe("UpdateProjectStatus(uint256 projectId, bool newStatus)", function () {
      it("Shouldnt UpdateProjectStatus, revert : Access Control", async function () {
        const { crowdfunding, addr1, projectID } = await loadFixture(createProjectAndDonateFixture);
        let UPDATER_ROLE = await crowdfunding.connect(addr1).UPDATER_ROLE();
        await expectRevert(crowdfunding.connect(addr1).updateProjectStatus(projectID, 0),
          "AccessControl: account " +
          addr1.address.toLowerCase() +
          " is missing role " +
          UPDATER_ROLE
        );
      });

      it("Shouldnt UpdateProjectStatus, revert : Invalid Project Id", async function () {
        const {Crowdfunding, crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
        await expect(crowdfunding.connect(owner).updateProjectStatus(100, 0)).to.be.revertedWithCustomError(Crowdfunding, 'InvalidProjectId');
      });

      it("Should UpdateProjectStatus, false", async function () {
        const { crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
        await crowdfunding.connect(owner).updateProjectStatus(projectID, false)
        const project = await crowdfunding.connect(owner).getProject(projectID);
        expect(project.isActive).to.be.equal(false);
      });

      it("Should UpdateProjectStatus, true", async function () {
        const { crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
        await crowdfunding.connect(owner).updateProjectStatus(projectID, false)
        let project = await crowdfunding.connect(owner).getProject(projectID);
        expect(project.isActive).to.be.equal(false);

        await crowdfunding.connect(owner).updateProjectStatus(projectID, true)
        project = await crowdfunding.connect(owner).getProject(projectID);
        expect(project.isActive).to.be.equal(true);
      });

      it("Should UpdateProjectStatus, emit ProjectStatusUpdated Event", async function () {
        const { crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);

        expect(await crowdfunding.connect(owner).updateProjectStatus(projectID, 0))
          .to.emit(crowdfunding, 'ProjectStatusUpdated').withArgs(projectID, 0);
      });
    });
    describe("UpdateProjectVoteCooldown(uint256 projectId, uint256 newCooldown)", function () {
      it("Shouldnt UpdateProjectVoteCooldown, revert : Access Control", async function () {
        const { crowdfunding, addr1, projectID } = await loadFixture(createProjectAndDonateFixture);
        let UPDATER_ROLE = await crowdfunding.connect(addr1).UPDATER_ROLE();
        await expectRevert(crowdfunding.connect(addr1).updateProjectVoteCooldown(projectID, 0),
          "AccessControl: account " +
          addr1.address.toLowerCase() +
          " is missing role " +
          UPDATER_ROLE
        );
      });
  
      it("Shouldnt UpdateProjectVoteCooldown, revert : Invalid Project Id", async function () {
        const {Crowdfunding, crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
        await expect(crowdfunding.connect(owner).updateProjectVoteCooldown(100, 0)).to.be.revertedWithCustomError(Crowdfunding, 'InvalidProjectId');
      });

      it("Should UpdateProjectStatus", async function () {
        const {Crowdfunding, crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
        const newcooldown = 3600;
        await crowdfunding.connect(owner).updateProjectVoteCooldown(projectID, newcooldown);
        const project = await crowdfunding.connect(owner).getProject(projectID);
        expect(project.voteCooldown).to.be.equal(newcooldown);
      });
    });
    describe("getProject(uint256 projectId)", function () {
      it("Shouldnt getProject, revert : Invalid Project Id", async function () {
        const {Crowdfunding, crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
        const invalidProjectID = 100;
        await expect(crowdfunding.connect(owner).getProject(invalidProjectID)).to.be.revertedWithCustomError(Crowdfunding, 'InvalidProjectId');
      });

      it("Should getProject", async function () {
        const { crowdfunding, owner, projectID, projectData } = await loadFixture(createProjectAndDonateFixture);
        const project = await crowdfunding.connect(owner).getProject(projectID);
        expect(project.assoName).to.be.equal(projectData.assoName);
      });
    });
    describe("getProjectThresholds(uint256 projectId, uint256 thresholdId)", function () {
      it("Shouldnt getProjectThresholds, revert : Invalid Project Id", async function () {
        const {Crowdfunding, crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
        const invalidProjectID = 100;
        await expect(crowdfunding.connect(owner).getProjectThresholds(invalidProjectID, 0)).to.be.revertedWithCustomError(Crowdfunding, 'InvalidProjectId');
      });

      it("Shouldnt getProjectThresholds, revert : Invalid Threshold Id", async function () {
        const {Crowdfunding, crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
        const invalidThresholdID = 100;
        await expect(crowdfunding.connect(owner).getProjectThresholds(projectID, invalidThresholdID)).to.be.revertedWithCustomError(Crowdfunding, 'InvalidThresholdId');
      });

      it("Should getProjectThresholds", async function () {
        const { crowdfunding, owner, projectID, thresholds } = await loadFixture(createProjectAndDonateFixture);
        const threshold = await crowdfunding.connect(owner).getProjectThresholds(projectID, 0);
        expect(threshold.budget).to.be.equal(thresholds[0].budget);
        expect(threshold.voteSession.isVotingInSession).to.be.equal(thresholds[0].voteSession.isVotingInSession);
        expect(threshold.voteSession.positiveVotes).to.be.equal(thresholds[0].voteSession.positiveVotes);
        expect(threshold.voteSession.negativeVotes).to.be.equal(thresholds[0].voteSession.negativeVotes);
      });
    });
    describe("getThresholdVoteFromAddress(address voterAddress, uint256 projectId, uint256 thresholdId)", function () {
    it("Shouldnt getThresholdVoteFromAddress, revert : Invalid Project Id", async function () {
      const {Crowdfunding, crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
      const invalidProjectID = 100;
      await expect(crowdfunding.connect(owner).getThresholdVoteFromAddress(owner.address, invalidProjectID, 0)).to.be.revertedWithCustomError(Crowdfunding, 'InvalidProjectId');
    });

    it("Shouldnt getThresholdVoteFromAddress, revert : Invalid Threshold Id", async function () {
      const {Crowdfunding, crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
      const invalidThresholdID = 100;
      await expect(crowdfunding.connect(owner).getThresholdVoteFromAddress(owner.address, projectID, invalidThresholdID)).to.be.revertedWithCustomError(Crowdfunding, 'InvalidThresholdId');
    });

    it("Should getThresholdVoteFromAddress", async function () {
      const { crowdfunding, owner, projectID, thresholds, voteValue } = await loadFixture(donateToProject3AndHasVoted);
      const thresholdVote = await crowdfunding.connect(owner).getThresholdVoteFromAddress(owner.address, projectID, 0);
      expect(thresholdVote).to.be.equal(voteValue);
    });
    });
    describe("getUserDonations(address donatorAddress, uint256 projectId)", function () {
    it("Shouldnt getUserDonations, revert : Invalid Project Id", async function () {
      const {Crowdfunding, crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
      const invalidProjectID = 100;
      await expect(crowdfunding.connect(owner).getUserDonations(owner.address, invalidProjectID)).to.be.revertedWithCustomError(Crowdfunding, 'InvalidProjectId');
    });

    it("Should getUserDonations", async function () {
      const { crowdfunding, owner, projectID, donatedAmount } = await loadFixture(createProjectAndDonateFixture);
      const donationAmount = await crowdfunding.connect(owner).getUserDonations(owner.address, projectID)
      expect(donationAmount).to.be.equal(donatedAmount);
    });
    });


    describe("withdrawFundsToOtherProject(uint256 fromProjectID, uint256 toProjectID)", function () {
      it("Shouldnt withdrawFundsToOtherProject, revert : Invalid Project Id from", async function () {
        const {Crowdfunding, crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
        const invalidProjectID = 100;
        await expect(crowdfunding.connect(owner).withdrawFundsToOtherProject(invalidProjectID, projectID)).to.be.revertedWithCustomError(Crowdfunding, 'InvalidProjectId');
      });

      it("Shouldnt withdrawFundsToOtherProject, revert : Invalid Project Id to", async function () {
        const {Crowdfunding, crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
        const invalidProjectID = 100;
        await expect(crowdfunding.connect(owner).withdrawFundsToOtherProject(projectID, invalidProjectID)).to.be.revertedWithCustomError(Crowdfunding, 'InvalidProjectId');
      });

      it("Shouldnt withdrawFundsToOtherProject, revert : CantWithdrawToSameProject", async function () {
        const {Crowdfunding, crowdfunding, owner, projectID } = await loadFixture(createProjectAndDonateFixture);
        await expect(crowdfunding.connect(owner).withdrawFundsToOtherProject(projectID, projectID)).to.be.revertedWithCustomError(Crowdfunding, 'CantWithdrawToSameProject');
      });

      it("Shouldnt withdrawFundsToOtherProject, revert : Access Control", async function () {
        const {Crowdfunding, crowdfunding, addr1, projectID } = await loadFixture(createProjectAndDonateFixture);
        let UPDATER_ROLE = await crowdfunding.connect(addr1).UPDATER_ROLE();
        await expectRevert(crowdfunding.connect(addr1).withdrawFundsToOtherProject(projectID, projectID),
          "AccessControl: account " +
          addr1.address.toLowerCase() +
          " is missing role " +
          UPDATER_ROLE
        );
      });

      it("Shouldnt withdrawFundsToOtherProject, revert : NoFundsToWithdraw", async function () {
        const {Crowdfunding, crowdfunding, owner,  } = await loadFixture(createSecondProject);
        const firstProjectId = 0;
        const seconsProjectId = 1;
        await expect(crowdfunding.connect(owner).withdrawFundsToOtherProject(seconsProjectId, firstProjectId)).to.be.revertedWithCustomError(Crowdfunding, 'NoFundsToWithdraw');
      });

      it("Shouldnt withdrawFundsToOtherProject, revert : DifferentExchangeToken", async function () {
        const {Crowdfunding, crowdfunding, owner } = await loadFixture(createProjectWithDifferentToken);
        const firstProjectId = 0;
        const thirdProjectId = 1;
        await expect(crowdfunding.connect(owner).withdrawFundsToOtherProject(firstProjectId, thirdProjectId)).to.be.revertedWithCustomError(Crowdfunding, 'DifferentExchangeToken');
      });

      it("Shouldnt withdrawFundsToOtherProject, revert : ProjectNotActive", async function () {
        const {Crowdfunding, crowdfunding, owner } = await loadFixture(createSecondProject);
        const firstProjectId = 0;
        const seconsProjectId = 1;
        await crowdfunding.connect(owner).updateProjectStatus(seconsProjectId, 0);
        await expect(crowdfunding.connect(owner).withdrawFundsToOtherProject(firstProjectId, seconsProjectId)).to.be.revertedWithCustomError(Crowdfunding, 'ProjectNotActive');
      });
  
      it("Should withdrawFundsToOtherProject", async function () {
        const { crowdfunding, owner} = await loadFixture(createSecondProject);
        const firstProjectId = 0;
        const seconsProjectId = 1;

        const firstProject = await crowdfunding.connect(owner).getProject(firstProjectId);
        const secondProject = await crowdfunding.connect(owner).getProject(seconsProjectId);

        const currentAmountFirstProject = firstProject.currentAmount;
        const currentAmountSecondProject = secondProject.currentAmount;

        await crowdfunding.connect(owner).withdrawFundsToOtherProject(firstProjectId, seconsProjectId);

        const firstProjectAfter = await crowdfunding.connect(owner).getProject(firstProjectId);
        const secondProjectAfter = await crowdfunding.connect(owner).getProject(seconsProjectId);

        expect(firstProjectAfter.currentAmount).to.be.equal(0);
        expect(secondProjectAfter.currentAmount).to.be.equal(currentAmountFirstProject.add(currentAmountSecondProject));
     
      });

      it("Should withdrawFundsToOtherProject from inactive project", async function () {
        const { crowdfunding, owner} = await loadFixture(createSecondProject);
        const firstProjectId = 0;
        const seconsProjectId = 1;

        await crowdfunding.connect(owner).updateProjectStatus(firstProjectId, false);

        const firstProject = await crowdfunding.connect(owner).getProject(firstProjectId);
        const secondProject = await crowdfunding.connect(owner).getProject(seconsProjectId);

        const currentAmountFirstProject = firstProject.currentAmount;
        const currentAmountSecondProject = secondProject.currentAmount;
        expect(firstProject.isActive).to.be.equal(false);

        await crowdfunding.connect(owner).withdrawFundsToOtherProject(firstProjectId, seconsProjectId);

        const firstProjectAfter = await crowdfunding.connect(owner).getProject(firstProjectId);
        const secondProjectAfter = await crowdfunding.connect(owner).getProject(seconsProjectId);

        expect(firstProjectAfter.currentAmount).to.be.equal(0);
        expect(secondProjectAfter.currentAmount).to.be.equal(currentAmountFirstProject.add(currentAmountSecondProject));
        expect(firstProjectAfter.isActive).to.be.equal(false);
     
      });
      });
    
});
});
