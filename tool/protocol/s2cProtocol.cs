using UnityEngine;
using System.Collections;

public class S2CProtocol : MonoBehaviour {

	public class registerAccountReply {
		public int id = -561450825;
		public string k_id = null;
		public int result = 0;
	} // end registerAccountReply

	public class unregisterAccountReply {
		public int id = -734332534;
		public string k_id = null;
		public int result = 0;
	} // end unregisterAccountReply

	public class startGameReply {
		public int id = -803210640;
		public string k_id = null;
		public int result = 0;
		public int heart = 0;
		public long last_charged_time = 0;
	} // end startGameReply

	public class accountInfo {
		public int id = 86832461;
		public string k_id = null;
		public int result = 0;
		public int coin = 0;
		public int mineral = 0;
		public int lv = 0;
		public int exp = 0;
		public int point = 0;
		public int heart = 0;
		public long last_charged_time = 0;
		public int selected_character = 0;
		public int selected_assistant = 0;
		public int characters = 0;
		public int basic_charac_lv = 0;
		public int assistants = 0;
		public int basic_assist_lv = 0;
		public int items = 0;
		public int count = 0;
	} // end accountInfo

	public class chargeInfo {
		public int id = 8843447;
		public string k_id = null;
		public int result = 0;
		public int heart = 0;
		public long last_charged_time = 0;
	} // end chargeInfo

	public class rankInfo {
		public int id = 1049161728;
		public string k_id = null;
		public int result = 0;
		public long overall_ranking = 0;
		public ProtocolElement.friendRankInfo[] ranking_list = null;
	} // end rankInfo

	public class gameResult {
		public int id = 7142187;
		public string k_id = null;
		public int result = 0;
		public int score = 0;
	} // end gameResult

	public class versionInfoReply {
		public int id = -304875355;
		public int result = 0;
	} // end versionInfoReply

	public class clientVerionInfoReply {
		public int id = 2005400364;
		public int result = 0;
	} // end clientVerionInfoReply

}
