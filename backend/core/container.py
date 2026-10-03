from ml.lip_model import DummyLipModel
from ml.corrector import DummyCorrector
from ml.emotion import DummyEmotion
from ml.tts import ConsoleTTS
from notifiers.console_notifier import ConsoleNotifier
# from repositories.memory_repos import (InMemoryConversationRepository,
#                                        InMemoryUserRepository)
from repositories.sqlite_repos import (SqliteConversationRepository,
                                       SqliteUserRepository)
from core.database import init_db
from domain.user import User
from services.history_service import HistoryService
from services.emergency_service import EmergencyService

from services.lipread_service import LipReadService
from ml.preprocessing import MouthCropper
# replace the memory_repos import with:

from pathlib import Path
from ml.lip_model import DummyLipModel, PretrainedLipNet
from ml.corrector import DummyCorrector, PassthroughCorrector

WEIGHTS = Path(__file__).resolve().parent.parent / "ml" / "models" / "lipnet_unseen.pt"

class Container:

    def _seed_demo_user(self):   # <- and this method
        count = self.user_repo.count()
        print(f"[DB] users in table: {count}")
        if count == 0:
            self.user_repo.add(User(
                name="Demo User", email="demo@test.com",
                guardian_name="Guardian", guardian_contact="guardian@test.com"))
            print("[DB] seeded demo user")
        
    def __init__(self):
        init_db() 
        # ML + infrastructure (swap these for real ones later)
       
        # self.preprocessor = MouthCropper()   
        
        # self.model = DummyLipModel()
        # self.corrector = DummyCorrector()

        self.preprocessor = MouthCropper(grayscale=False)
        self.model = PretrainedLipNet(str(WEIGHTS))
        self.corrector = PassthroughCorrector()

        self.emotion = DummyEmotion()
        self.tts = ConsoleTTS()
        self.notifier = ConsoleNotifier()
        # self.conv_repo = InMemoryConversationRepository()
        # self.user_repo = InMemoryUserRepository()

        self.conv_repo = SqliteConversationRepository()
        self.user_repo = SqliteUserRepository()

        self._seed_demo_user() 
        # Services
        self.history = HistoryService(self.conv_repo)
        self.lipread = LipReadService(self.preprocessor,self.model, self.corrector,
                                      self.emotion, self.history)
        self.emergency = EmergencyService(self.tts, self.notifier, self.user_repo)

# One shared instance for the whole app
container = Container()