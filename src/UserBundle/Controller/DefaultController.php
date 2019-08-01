<?php

namespace UserBundle\Controller;

use DemandeBundle\Entity\Demande;
use Kilik\TableBundle\Components\Column;
use Kilik\TableBundle\Components\Filter;
use Kilik\TableBundle\Components\Table;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\Serializer;
use UserBundle\Entity\User;
use UserBundle\Form\UserType;
use AdminBundle\Controller\DefaultController as D;
use Symfony\Component\HttpFoundation\Response;

class DefaultController extends D
{

    public function getUsersAction()
    {
        $restresult = $this->getDoctrine()->getRepository('UserBundle:User')->findAll();
        if ($restresult === null) {
            return new View("there are no users exist", Response::HTTP_NOT_FOUND);
        }
        return $restresult;
    }
    private function getTable(User $user)
    {
        $queryBuilder = $this->getDoctrine()->getRepository('UserBundle:User')->createQueryBuilder('u')
            ->select('u')
            ->setParameter('user', $user);




        $table = (new Table())
            ->setId('tabledemo_user')
            ->setQueryBuilder($queryBuilder, 'u')
            ->setTemplate('UserBundle:User/Default:index.html.twig');






        return $table;
    }



    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();
        $users = $em->getRepository(User::class)->findAll();
        $u1 = new User();
        // get product kilik table
       /* $table = $this->getTable($u1);

        return [
            'table' => $this->get('kilik_table')->createFormView($table),
            'user' => $u1,
        ];*/



       return $this->render('@User/Default/index.html.twig',array('users'=>$users) );

    }

    public function createAction(Request $request){



        $user = new User();

        $form = $this->createForm(UserType::class, $user);
        $form->handleRequest($request); /*creation d'une session pr stocker les valeurs de l'input*/


        if ($form->isValid()) {
            $user->setEnabled(true);
            $user->setPlainPassword("ABCD");
            $body =  "Bonjour ". $user->nom ." ".$user->getPrenom() .
            "<center>Bienvenue!!!</center><br>Bienvenue sur notre application. vous pouvez maintenant connectez chez  votre espace client en utilisiant les cordonnées cii-dessous :<br>"
                ."login :" . $user->getUsername() ."<br>"
                . "Mot de passe :" .$user->getPlainPassword().
            "<br><br><h5>Steedex support</h5>"
            ;
            //return  new Response($body);
            $em = $this->getDoctrine()->getManager();

            $em->persist($user);

            $message = (new \Swift_Message('Bienvenue chez Steedex'))
                ->setFrom('belhadjali.seif@gmail.com')
                ->setTo($user->getEmail())
                ->setBody($body
                );


            $this->get('mailer')->send($message);

            $em->flush();

            $this->addFlash('success', 'Utilisateur ajoutée avec success!');

            return $this->redirectToRoute("_list_users");

        }
        return $this->render('@User/Default/create.html.twig', array(
            'form' => $form->createView()
        ));



    }

    public function removeAction(Request $request,$id){
        $em=$this->getDoctrine()->getManager();
        $user=$em->getRepository("UserBundle:User")->find($id);
        if ($user!=null){
            $em->remove($user);
            $em->flush();
        }

        return $this->redirectToRoute("_list_users");
    }

    public function updateAction(Request $request,$id){

        $em=$this->getDoctrine()->getManager();
        $user=$em->getRepository("UserBundle:User")->find($id);
        $form=$this->createForm(UserType::class,$user);
        $form->handleRequest($request);

        if($form->isValid())
        {
            $em->persist($user);
            $em->flush();
            return $this->redirectToRoute('_list_users');
        }


        return $this->render("@User/Default/update.html.twig",array(
            'form'=>$form->createView()
        ));

    }


    public function sendToUserAction($id){

        $em = $this->getDoctrine()->getManager();
        $user = $em->getRepository(User::class)->findOneBy(['id' => $id]);
        $mail_adr = $user->getEmail();
        $login = $user->getUsername();
        $mdp = $user->getPassword();

        $message = (new \Swift_Message('Info Compte'))
            ->setFrom('belhadjali.seif@gmail.com')
            ->setTo($mail_adr)
            ->setBody(
                $login . " " . $mdp
            );
        $this->get('mailer')->send($message);
        return $this->redirectToRoute('_list_users');


    }


    public function sendToAdminAction($id){

        $em = $this->getDoctrine()->getManager();
        $user = $em->getRepository(User::class)->findOneBy(['id' => $id]);
        $mail_adr = $user->getEmail();
        $login = $user->getUsername();
        $mdp = $user->getPassword();

        $message = (new \Swift_Message('Info Compte - Steedex Admin'))
            ->setFrom('belhadjali.seif@gmail.com')
            ->setTo('belhadjali.seif@gmail.com')
            ->setTo($mail_adr)
            ->setBody(
                $login . " " . $mdp
            );
        $this->get('mailer')->send($message);
        return $this->redirectToRoute('_list_users');


    }


    public function testMailAction()
    {
        $message = (new \Swift_Message('Demande prête'))
            ->setFrom('belhadjali.seif@gmail.com')
            ->setTo('belhadjali.seif@gmail.com')
            ->setBody(
                "Votre demande est prête. Vous pouvez venir la récupérer"
            );
        $this->get('mailer')->send($message);
        return $this->redirectToRoute('_list_users');
    }

    public function ordreDeMissionAction(){


        $user = new User();

        $em = $this->getDoctrine()->getManager();


        $listeLivreur = $em->getRepository('UserBundle:User')->findByRole("ROLE_LIVREUR");

        return $this->render("@User/Default/ordreMission.html.twig",array(
            'listeLivreur'=>$listeLivreur
        ));

    }

    public function livDemAction($id){

        $em = $this->getDoctrine()->getManager();

        $listeDemandeByLivreur = $em->getRepository("DemandeBundle:Demande")->getLivreurDemandes($id);





        return $this->render("@User/Default/demandeBylivreur.html.twig",array(
            'listeDemandeByLivreur'=>$listeDemandeByLivreur,
            'idLivreur' => $id
        ));

    }
    public function generateOrdreMissionAction(Request $request){
        $em = $this->getDoctrine()->getManager();
        $listeD = [];
        $para = $request->get('data');
        foreach ($para as $p){
            $d = new Demande();
            $listeDemande = $em->getRepository('DemandeBundle:Demande')->findOneBy(array('id' => $p));
            array_push($listeD,$listeDemande);
        }



        if($request->isXmlHttpRequest() ) {
            $serialzier = new Serializer(array(new ObjectNormalizer()));
            $v = $serialzier->normalize($listeD);
            return $this->render('@User/Default/generateOrdre.html.twig',array('listeD'=>$listeD));

            //return new JsonResponse($v);

        }
        $html2pdf = new Html2Pdf('L','A4','en');
        $html2pdf->setTestIsImage(true);
        $ecole ="jj";
        return $this->render('@User/Default/generateOrdre.html.twig',array('listeD'=>$listeD));



        // return new JsonResponse($v);


    }




}
