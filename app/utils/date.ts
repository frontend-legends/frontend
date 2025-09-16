export function getGreeting(date: string): { message: string, icon: string } {
  const currentHour = Number(date?.split(" ")[1]?.slice(0, 2));

  if (currentHour >= 5 && currentHour < 12) {
    return {
      message: "Good morning",
      icon: "ph:mountains-bold"
    };
  } else if (currentHour >= 12 && currentHour < 17) {
    return {
      message: "Good afternoon",
      icon: "ph:sun-bold",
    };
  } else if (currentHour >= 17 && currentHour < 21) {
    return {
      message: "Good evening",
      icon: "ph:sun-horizon-bold",
    };
  } else {
    return {
      message: "Good night",
      icon: "ph:moon-bold",
    };
  }
}
