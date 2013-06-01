using UnityEngine;
using System.Collections;

public class C2SProtocol : MonoBehaviour {

	public class registerAccount {
		public int id = 1791621329;
		public string k_id = null;
	} // end registerAccount

	public class unregisterAccount {
		public int id = 1727001234;
		public string k_id = null;
	} // end unregisterAccount

	public class loadUserInfo {
		public int id = 19331440;
		public string k_id = null;
	} // end loadUserInfo

	public class checkInCharge {
		public int id = 890369080;
		public string k_id = null;
	} // end checkInCharge

	public class startGame {
		public int id = 193227;
		public string k_id = null;
		public int selected_character = 0;
		public int selected_assistant = 0;
	} // end startGame

	public class endGame {
		public int id = 1309014912;
		public string k_id = null;
		public int dist = 0;
		public int kill = 0;
		public int usedItem = 0;
	} // end endGame

	public class loadRankInfo {
		public int id = 1963864;
		public string k_id = null;
	} // end loadRankInfo

	public class requestPointReward {
		public int id = -239339370;
		public string k_id = null;
		public int point = 0;
	} // end requestPointReward

}
