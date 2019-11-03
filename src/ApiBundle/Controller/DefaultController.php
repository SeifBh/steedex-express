<?php

namespace ApiBundle\Controller;

use DemandeBundle\Entity\Demande;
use DemandeBundle\Enum\DemandeEtatEnum;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use UserBundle\Entity\User;
use UserBundle\Entity\UserToken;

class DefaultController extends Controller
{
    public function indexAction()
    {
        $em=$this->getDoctrine()->getManager();
        $users=$em->getRepository("UserBundle:User")->findAll();

        $view = $this->view($users,200);
        return $this->handleView($view);
    }

    public function getDemandesAction()
    {
        $articles = $this->getDoctrine()->getRepository('DemandeBundle:Demande')->findBy(array(), array('updated_date' => 'DESC'));
        $data = $this->get('jms_serializer')->serialize($articles, 'json');

        $response = new Response($data);
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }

    public function getDemandeClientAction($id_client)
    {
        $demande = new Demande();

        $selectedUser = $this->getDoctrine()->getRepository("UserBundle:User")->findBy(['id'=>$id_client]);
        $articles = $this->getDoctrine()->getRepository('DemandeBundle:Demande')->findBy(array('id_client' => $selectedUser), array('updated_date' => 'DESC'));



        $data = $this->get('jms_serializer')->serialize($articles, 'json');

        $response = new Response($data);
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }


    public function getDemandeLivreurAction($id_livreur)
    {
        $demande = new Demande();


        $selectedUser = $this->getDoctrine()->getRepository("UserBundle:User")->findBy(['id'=>$id_livreur]);

        $articles = $this->getDoctrine()->getRepository('DemandeBundle:Demande')->findBy(array('id_livreur' => $selectedUser), array('updated_date' => 'DESC'));


        $data = $this->get('jms_serializer')->serialize($articles, 'json');

        $response = new Response($data);
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }


    public function updateDemandeAction($id,$etat)
    {
        $demande = new Demande();



        $selectedDemande = $this->getDoctrine()->getRepository("DemandeBundle:Demande")->findOneBy(['id'=>$id]);
        if ($etat == "EnCours")
            $selectedDemande->setEtat(DemandeEtatEnum::ETAT_EnCours);
        else if ($etat == "EnTraitement")
            $selectedDemande->setEtat(DemandeEtatEnum::ETAT_EnTraitement);
        else if ($etat == "Valide")
            $selectedDemande->setEtat(DemandeEtatEnum::ETAT_Valide);
        else if ($etat == "Cloture")
            $selectedDemande->setEtat(DemandeEtatEnum::ETAT_Cloture);
        else if ($etat == "Retour")
            $selectedDemande->setEtat(DemandeEtatEnum::ETAT_Retour);



        $selectedDemande->setUpdatedDate(new \DateTime());
        $this->getDoctrine()->getManager()->persist($selectedDemande);
        $this->getDoctrine()->getManager()->flush();



        $ust = new UserToken();




        $em = $this->getDoctrine()->getManager();


        $userIdTok = strval($selectedDemande->getIdClient()->getId()) ;


        $userTok = $this->getDoctrine()
            ->getRepository(UserToken::class)
            ->findBy(array('userId' => $userIdTok));


        foreach ($userTok as $offset => $record) {

         //   return new Response($record->getToken());
            //return new Response($selectedDemande->getTitre());
            echo 'Hello';
            define( 'API_ACCESS_KEY', 'AAAALjS64JI:APA91bESxxaGhL38Aea6kH8AJHnImgVl64u7ogPV72yrAkNce2MjjGZXzmFO2M69j-wXD5QVsOnhfDRcpE2ivZw2OyOopm3j2ODOQtyZtDdyyv4HXfVdodmJiSNHZOL_YxuIG6k82VB7');
            //   $registrationIds = ;
#prep the bundle
            $msg = array
            (
                'body' 	=> 'Seif',
                'title'	=> 'adf',

            );
            $t1 = strval($selectedDemande->getTitre()) ;
            $e1 = strval($selectedDemande->getEtat()) ;

            $fields = array
            (
                'to'		=> $record->getToken(),
                'notification'	=>   array("title"=>$t1, "body" => $e1),
            );


            $headers = array
            (
                'Authorization: key=' . API_ACCESS_KEY,
                'Content-Type: application/json'
            );
#Send Reponse To FireBase Server
            $ch = curl_init();
            curl_setopt( $ch,CURLOPT_URL, 'https://fcm.googleapis.com/fcm/send' );
            curl_setopt( $ch,CURLOPT_POST, true );
            curl_setopt( $ch,CURLOPT_HTTPHEADER, $headers );
            curl_setopt( $ch,CURLOPT_RETURNTRANSFER, true );
            curl_setopt( $ch,CURLOPT_SSL_VERIFYPEER, false );
            curl_setopt( $ch,CURLOPT_POSTFIELDS, json_encode( $fields ) );
            $result = curl_exec($ch );
            echo $result;
            curl_close( $ch );


        }


        $response = new JsonResponse("updated");


        return $response;
    }


    public function tokensAction()
    {
        $em=$this->getDoctrine()->getManager();

       $query=$em->createQuery('SELECT p FROM UserBundle:UserToken p');



        $tokens = $query->getResult();

        $tokens2 = $this->getDoctrine()->getRepository("UserBundle:UserToken")->findAll();


        $data = $this->get('jms_serializer')->serialize($tokens2
            , 'json');

        $response = new Response($data);
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }


    public function createTokensAction($id,$tok)
    {

        $ut = new UserToken();
        $ut->setUserId($id);
        $ut->setToken($tok);

        $this->getDoctrine()->getManager()->persist($ut);
        $this->getDoctrine()->getManager()->flush();

        $response = new JsonResponse("token created");




        return $response;
    }




    public function deleteTokensAction($tok)
    {

        $ut = new UserToken();




        $em = $this->getDoctrine()->getManager();

        $selectedToken = $em->getRepository("UserBundle:UserToken")->findOneBy(['token'=>$tok]);

        if ($selectedToken != null) {

            $em->remove($selectedToken);

            $em->flush();

        }


        $response = new JsonResponse("token removed");




        return $response;
    }

}
