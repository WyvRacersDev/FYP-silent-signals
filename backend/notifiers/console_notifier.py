from notifiers.base import Notifier

class ConsoleNotifier(Notifier):
    def send(self, to: str, message: str) -> bool:
        print(f"[NOTIFY -> {to}] {message}")
        return True