/*
 * KENNY MEJIA
 * PROFESSOR ZHANG
 * OCTOBER 7, 2019
 * ASSIGNMENT 6
 * 
 * >>>>>>>>>>>>>>>>>IMPORTANT<<<<<<<<<<<<<<<<<<<<
 * ORIGINAL CODE HEAVILY MODIFIED IN ORDER TO REMOVE 
 * UNECCESSARY VARIABLES AND FUNCTIONS THAT WERE NOT 
 * NECESSARY FOR THE CURRENT TASK AT HAND
 * 
 * 
 */

import java.util.LinkedList;
import java.util.Stack;

public class Graph {
	private Vertex vertexList[];
	private LinkedList<LinkedList<Integer>> adjlist;
	private int nVerts;
	
	/*
	 * WE CREATE A GRAPH WITH 6 VERTEX BEING 0,1,2,3,4,5
	 * WE ADD THE EDGES THAT GO FROM ONE VERTEX TO THE OTHER
	 * WE PRINT OUT THE VERTEX AND LASTLY THE ELEMENTS IN
	 * EACH ADJ LIST
	 * LASTLY WE CALL OUR CYCLE FUNCTION THAT CHECKS TO SEE
	 * IF THE GRAPH HAS A CYCLE OR NOT
	 */
	
	public static void main(String[] args) {
		
		Graph theGraph = new Graph(6);
		
		theGraph.addVertex('0');
		theGraph.addVertex('1');
		theGraph.addVertex('2');
		theGraph.addVertex('3');
		theGraph.addVertex('4');
		theGraph.addVertex('5');
		
		theGraph.addEdge(0, 1); 
		theGraph.addEdge(0, 2); 
		theGraph.addEdge(1, 2); 
		theGraph.addEdge(1, 3); 
		theGraph.addEdge(2, 3); 
		theGraph.addEdge(3, 4);
		theGraph.addEdge(4, 1); 
		theGraph.addEdge(4, 0); 
		theGraph.addEdge(4, 5);
		
		for (int x = 0; x < 6; x++)
		{
			System.out.println(x + " -> " + theGraph.adjlist.get(x));
		}
		
		System.out.println("Does The Graph Have A Cycle?");
		System.out.println(theGraph.cycle());
		
	}
 
	public Graph(int n) {
		  vertexList = new Vertex[n];
		  int [] vertexcycleflag = new int[n];
		  
		  //cycle flag 
		  for  (int i = 0; i < n; i++) {
			  vertexcycleflag[i]=-1;
		  }
		 
		  //adj list
		  
		  adjlist = new LinkedList<LinkedList<Integer>>();
		  for (int i = 0; i < n; i++) {
				
				adjlist.add(new LinkedList<Integer>());
			}
		 }
 
	public void addVertex(char nodename) {// add vertex
		vertexList[nVerts++] = new Vertex(nodename);
	}
 
	public void addEdge(int start, int end) {

		//adj list
		
		if(!adjlist.get(start).contains(end))
			adjlist.get(start).add(end);
	}
			
	public int getNextVertex(int position) 
	{
		
		for (int i = 0; i < adjlist.get(position).size(); i++) 
		{
			if (vertexList[adjlist.get(position).get(i)].cycleflag == -1) 
			{	
				return adjlist.get(position).get(i);
			}
		}
		return -1;
	}
	
	/*
	 *	OUR FUNCTION TO CHECK AND SEE IF THERE EXISTS A CYCLE IN THE GRAPH 
	 * WE CREATE OUR OWN STACK THAT IS OF TYPE VERTEX
	 * WE TAKE OUR FIRST ELEMENT AND CHANGE ITS FLAG FROM -1 TO 0
	 * WE PUSH INTO OUR STACK
	 * WE LOOP AND WHILE THE STACK IS NOT EMPTY WE TRY AND GET OUR NEXT VERTEX
	 * IF WE RETURN A -1 FROM THE FUCNCTION THEN THAT MEANS THAT THERE DOES NOT 
	 * EXIST AN UNVISITED NODE SO THERE WOULD EXIST A CYCLE
	 * IF WE MAKE IT PAST THIS CHECK THEN WE GET THE NEXT VERTEX BEING ITS NEIGHBOR
	 * OF COURSE WE CHECK THE CYCLE FLAG TO SEE IF ITS -1
	 * IF SO WE CHANGE IT TO 0 AND PUSH THE VERTEX INTO THE STACK
	 * IF WE REACH THE ELSE STATEMENT INSTEAD WE CHANGE THE ORIGINAL NODE WE WERE 
	 * CHECKING'S CYCLE FLAG TO 1 AND POP IT FROM THE STACK SINCE THAT WOULD MEAN
	 * THAT WE ARE DONE WITH THE CURRENT VERTEX
	 */
	public boolean cycle () {
		
		Stack <Vertex> myStack = new Stack <Vertex>();
		
		//Visit the starting node
		vertexList[0].cycleflag = 0; 
		myStack.push(vertexList[0]);
		
		while (!myStack.isEmpty()) 
		{
			int position = getNextVertex(Character.getNumericValue(myStack.peek().lable));
			
			if ( position == -1 )
			{
				//THERE EXISTS A CYCLE BECAUSE OUR GET FUNCTION RETURNED A -1 
				//THIS MEANS IT CANNOT FIND AN UNVISITED NODE
				return true;
			}
			
			if (vertexList[position].cycleflag == -1) 
			{	
				vertexList[position].cycleflag = 0;
				myStack.push(vertexList[position]);
			} 
			else 
			{
				myStack.peek().cycleflag = 1;
				myStack.pop();
			}
		}
 		return false;
	}
}