using UnityEngine;
using System.Collections;

public class R2GProtocol : MonoBehaviour {

	public class requestRankingReply {
		public int id = -562433242;
		public string k_id = null;
		public int result = 0;
		public int overall_ranking = 0;
		public ProtocolElement.friendRankInfo[] ranking_list = null;
	} // end requestRankingReply

}
